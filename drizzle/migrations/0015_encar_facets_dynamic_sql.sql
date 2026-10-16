create or replace function public.encar_facets(
  _brand text default null,
  _model text default null,
  _year_from int default null,
  _year_to int default null,
  _price_min bigint default null,
  _price_max bigint default null,
  _mileage_min int default null,
  _mileage_max int default null,
  _fuels text[] default null,
  _transmissions text[] default null,
  _body_types text[] default null,
  _regions text[] default null,
  _no_accident boolean default false
) returns jsonb
language plpgsql stable
set statement_timeout = '15s'
as $$
declare
  c text := 'status = ''active''';
  q_brand text := '';
  q_model text := '';
  q_fuels text := '';
  q_trans text := '';
  q_body text := '';
  q_regions text := '';
  w_all text;
  w_brands text;
  w_models text;
  w_fuels text;
  w_trans text;
  w_body text;
  w_regions text;
  v_total bigint;
  v_brands jsonb;
  v_models jsonb;
  v_fuels jsonb;
  v_trans jsonb;
  v_body jsonb;
  v_regions jsonb;
begin
  if _year_from is not null then c := c || ' and year >= ' || _year_from; end if;
  if _year_to is not null then c := c || ' and year <= ' || _year_to; end if;
  if _price_min is not null then c := c || ' and price_original >= ' || _price_min; end if;
  if _price_max is not null then c := c || ' and price_original <= ' || _price_max; end if;
  if _mileage_min is not null then c := c || ' and mileage >= ' || _mileage_min; end if;
  if _mileage_max is not null then c := c || ' and mileage <= ' || _mileage_max; end if;
  if _no_accident then c := c || ' and has_accident = false'; end if;
  if _brand is not null then q_brand := ' and brand_slug = ' || quote_literal(_brand); end if;
  if _model is not null then q_model := ' and model_slug = ' || quote_literal(_model); end if;
  if _fuels is not null then q_fuels := ' and fuel_type = any(' || quote_literal(_fuels::text) || '::text[])'; end if;
  if _transmissions is not null then
    q_trans := ' and (transmission = any(' || quote_literal(_transmissions::text) || '::text[])'
      || case when 'auto' = any(_transmissions) then ' or transmission is null' else '' end || ')';
  end if;
  if _body_types is not null then q_body := ' and body_type = any(' || quote_literal(_body_types::text) || '::text[])'; end if;
  if _regions is not null then q_regions := ' and region = any(' || quote_literal(_regions::text) || '::text[])'; end if;

  w_all     := c || q_brand || q_model || q_fuels || q_trans || q_body || q_regions;
  w_brands  := c || q_fuels || q_trans || q_body || q_regions;
  w_models  := c || q_brand || q_fuels || q_trans || q_body || q_regions;
  w_fuels   := c || q_brand || q_model || q_trans || q_body || q_regions;
  w_trans   := c || q_brand || q_model || q_fuels || q_body || q_regions;
  w_body    := c || q_brand || q_model || q_fuels || q_trans || q_regions;
  w_regions := c || q_brand || q_model || q_fuels || q_trans || q_body;

  execute 'select count(*) from public.encar_listings where ' || w_all into v_total;

  execute 'select coalesce(jsonb_agg(jsonb_build_object(''slug'', brand_slug, ''name'', bn, ''count'', cnt) order by cnt desc), ''[]''::jsonb) from (select brand_slug, max(brand_name) as bn, count(*) as cnt from public.encar_listings where ' || w_brands || ' group by brand_slug) t' into v_brands;

  execute 'select coalesce(jsonb_agg(jsonb_build_object(''slug'', model_slug, ''name'', mn, ''count'', cnt) order by cnt desc), ''[]''::jsonb) from (select model_slug, max(model_name) as mn, count(*) as cnt from public.encar_listings where model_slug is not null and ' || w_models || ' group by model_slug) t' into v_models;

  execute 'select coalesce(jsonb_agg(jsonb_build_object(''value'', fuel_type, ''count'', cnt) order by cnt desc), ''[]''::jsonb) from (select fuel_type, count(*) as cnt from public.encar_listings where fuel_type is not null and ' || w_fuels || ' group by fuel_type) t' into v_fuels;

  execute 'select coalesce(jsonb_agg(jsonb_build_object(''value'', tr, ''count'', cnt) order by cnt desc), ''[]''::jsonb) from (select coalesce(transmission, ''auto'') as tr, count(*) as cnt from public.encar_listings where ' || w_trans || ' group by 1) t' into v_trans;

  execute 'select coalesce(jsonb_agg(jsonb_build_object(''value'', body_type, ''count'', cnt) order by cnt desc), ''[]''::jsonb) from (select body_type, count(*) as cnt from public.encar_listings where body_type is not null and ' || w_body || ' group by body_type) t' into v_body;

  execute 'select coalesce(jsonb_agg(jsonb_build_object(''value'', region, ''count'', cnt) order by cnt desc), ''[]''::jsonb) from (select region, count(*) as cnt from public.encar_listings where region is not null and ' || w_regions || ' group by region) t' into v_regions;

  return jsonb_build_object(
    'total', v_total,
    'brands', v_brands,
    'models', v_models,
    'fuels', v_fuels,
    'transmissions', v_trans,
    'body_types', v_body,
    'regions', v_regions
  );
end;
$$;