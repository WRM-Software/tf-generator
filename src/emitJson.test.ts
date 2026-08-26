import { describe, expect, it } from 'vitest';
import { TfBuilder } from './TfBuilder.js';
import { emitJson } from './emitJson.js';
import { ref, block } from './markers.js';

describe('emitJson', () => {
  it('encodes a Ref as a ${expr} string', () => {
    const tf = new TfBuilder();
    const rg = tf.resource('azurerm_resource_group', 'main', {
      name: 'rg-app',
      location: 'southeastasia',
    });
    tf.output('rg_id', { value: rg.attr('id') });

    const doc = JSON.parse(emitJson(tf));
    expect(doc.output.rg_id.value).toBe('${azurerm_resource_group.main.id}');

    // Also cover the standalone `ref()` escape hatch.
    const tf2 = new TfBuilder();
    tf2.output('raw', { value: ref('terraform.workspace') });
    const doc2 = JSON.parse(emitJson(tf2));
    expect(doc2.output.raw.value).toBe('${terraform.workspace}');
  });

  it('treats Block as a no-op — identical output with or without block()', () => {
    const body = { source: 'hashicorp/azurerm', version: '~> 4.0' };

    const tfWithBlock = new TfBuilder();
    tfWithBlock.terraform({ required_providers: block({ azurerm: body }) });

    const tfPlain = new TfBuilder();
    tfPlain.terraform({ required_providers: { azurerm: body } });

    expect(emitJson(tfWithBlock)).toBe(emitJson(tfPlain));

    // Array-bodied block() encodes as an array of encoded objects.
    const tfArrayBlock = new TfBuilder();
    tfArrayBlock.resource('azurerm_thing', 'main', {
      setting: block([{ name: 'a' }, { name: 'b' }]),
    });
    const doc = JSON.parse(emitJson(tfArrayBlock));
    expect(doc.resource.azurerm_thing.main.setting).toEqual([{ name: 'a' }, { name: 'b' }]);
  });

  it('passes a dynamic block through structurally unchanged, including a Ref in content', () => {
    const tf = new TfBuilder();
    tf.resource('azurerm_linux_web_app', 'web', {
      name: 'app-web',
      dynamic: {
        ip_restriction: {
          for_each: ref('var.ip_rules'),
          content: { ip_address: ref('ip_restriction.value.cidr') },
        },
      },
    });

    const doc = JSON.parse(emitJson(tf));
    expect(doc.resource.azurerm_linux_web_app.web).toEqual({
      name: 'app-web',
      dynamic: {
        ip_restriction: {
          for_each: '${var.ip_rules}',
          content: { ip_address: '${ip_restriction.value.cidr}' },
        },
      },
    });
  });

  it('wires module() as an Addressable that renders refs and passes source through as a plain string', () => {
    const tf = new TfBuilder();
    const rg = tf.resource('azurerm_resource_group', 'main', {
      name: 'rg-app',
      location: 'southeastasia',
    });

    const webApp = tf.module('web_app', {
      source: '../modules/webapp',
      resource_group_name: rg.attr('name'),
      location: rg.attr('location'),
      app_name: 'app-web',
    });

    tf.output('web_app_url', { value: webApp.attr('default_hostname') });

    const doc = JSON.parse(emitJson(tf));

    expect(doc.output.web_app_url.value).toBe('${module.web_app.default_hostname}');
    expect(doc.module.web_app.source).toBe('../modules/webapp');
    expect(doc.module.web_app.resource_group_name).toBe('${azurerm_resource_group.main.name}');
    expect(doc.module.web_app.location).toBe('${azurerm_resource_group.main.location}');
    expect(doc.module.web_app.app_name).toBe('app-web');
  });

  it('recursively encodes nested arrays and objects mixing primitives, refs, and plain objects', () => {
    const tf = new TfBuilder();
    tf.resource('azurerm_thing', 'main', {
      tags: { managed_by: ref('terraform.workspace'), env: 'prod' },
      rules: [
        { name: 'a', priority: 1, enabled: true, note: null },
        { name: 'b', priority: 2, source: ref('var.source_ip') },
      ],
      nested: {
        list: [1, 2, ref('local.three')],
        deep: { flag: false, value: ref('data.thing.main.id') },
      },
    });

    const doc = JSON.parse(emitJson(tf));
    expect(doc.resource.azurerm_thing.main).toEqual({
      tags: { managed_by: '${terraform.workspace}', env: 'prod' },
      rules: [
        { name: 'a', priority: 1, enabled: true, note: null },
        { name: 'b', priority: 2, source: '${var.source_ip}' },
      ],
      nested: {
        list: [1, 2, '${local.three}'],
        deep: { flag: false, value: '${data.thing.main.id}' },
      },
    });
  });

  it('emits a full multi-resource program matching the flagship usage example', () => {
    const tf = new TfBuilder();

    tf.terraform({
      required_providers: block({
        azurerm: { source: 'hashicorp/azurerm', version: '~> 4.0' },
      }),
    });

    tf.provider('azurerm', { features: block({}) });

    const rg = tf.resource('azurerm_resource_group', 'main', {
      name: 'rg-app',
      location: 'southeastasia',
    });

    const plan = tf.resource('azurerm_service_plan', 'app', {
      name: 'asp-app',
      resource_group_name: rg.attr('name'),
      location: rg.attr('location'),
      os_type: 'Linux',
      sku_name: 'P1v3',
    });

    const site = tf.resource('azurerm_linux_web_app', 'web', {
      name: 'app-web',
      resource_group_name: rg.attr('name'),
      location: rg.attr('location'),
      service_plan_id: plan.attr('id'),
      site_config: block({}),
    });

    tf.output('default_hostname', { value: site.attr('default_hostname') });

    expect(emitJson(tf)).toMatchSnapshot();
  });
});
