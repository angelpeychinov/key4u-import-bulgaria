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
language sql stable
as $$
with base as materialized (
  select brand_slug, brand_name, model_slug, model_name, fuel_type, transmission, body_type, region, has_accident
  from public.encar_listings
  where status = 'active'
    and (_year_from is null or year >= _year_from)
    and (_year_to is null or year <= _year_to)
    and (_price_min is null or price_original >= _price_min)
    and (_price_max is null or price_original <= _price_max)
    and (_mileage_min is null or mileage >= _mileage_min)
    and (_mileage_max is null or mileage <= _mileage_max)
    and (not _no_accident or has_accident = false)
),
agg as (
  select
    count(*) filter (
      where (_brand is null or brand_slug = _brand)
        and (_model is null or model_slug = _model)
        and (_fuels is null or fuel_type = any(_fuels))
        and (_transmissions is null or transmission = any(_transmissions) or ('auto' = any(_transmissions) and transmission is null))
        and (_body_types is null or body_type = any(_body_types))
        and (_regions is null or region = any(_regions))
    ) as total
  from base
),
brands as (
  select jsonb_agg(jsonb_build_object('slug', brand_slug, 'name', brand_name, 'count', c) order by c desc) as v
  from (
    select brand_slug, max(brand_name) as brand_name, count(*) as c
    from base
    where (_fuels is null or fuel_type = any(_fuels))
      and (_transmissions is null or transmission = any(_transmissions) or ('auto' = any(_transmissions) and transmission is null))
      and (_body_types is null or body_type = any(_body_types))
      and (_regions is null or region = any(_regions))
    group by brand_slug
  ) t
),
models as (
  select jsonb_agg(jsonb_build_object('slug', model_slug, 'name', model_name, 'count', c) order by c desc) as v
  from (
    select model_slug, max(model_name) as model_name, count(*) as c
    from base
    where (_brand is null or brand_slug = _brand)
      and model_slug is not null
      and (_fuels is null or fuel_type = any(_fuels))
      and (_transmissions is null or transmission = any(_transmissions) or ('auto' = any(_transmissions) and transmission is null))
      and (_body_types is null or body_type = any(_body_types))
      and (_regions is null or region = any(_regions))
    group by model_slug
  ) t
),
fuels as (
  select jsonb_agg(jsonb_build_object('value', fuel_type, 'count', c) order by c desc) as v
  from (
    select fuel_type, count(*) as c
    from base
    where fuel_type is not null
      and (_brand is null or brand_slug = _brand)
      and (_model is null or model_slug = _model)
      and (_transmissions is null or transmission = any(_transmissions) or ('auto' = any(_transmissions) and transmission is null))
      and (_body_types is null or body_type = any(_body_types))
      and (_regions is null or region = any(_regions))
    group by fuel_type
  ) t
),
transmissions as (
  select jsonb_agg(jsonb_build_object('value', tr, 'count', c) order by c desc) as v
  from (
    select coalesce(transmission, 'auto') as tr, count(*) as c
    from base
    where (_brand is null or brand_slug = _brand)
      and (_model is null or model_slug = _model)
      and (_fuels is null or fuel_type = any(_fuels))
      and (_body_types is null or body_type = any(_body_types))
      and (_regions is null or region = any(_regions))
    group by 1
  ) t
),
body_types as (
  select jsonb_agg(jsonb_build_object('value', body_type, 'count', c) order by c desc) as v
  from (
    select body_type, count(*) as c
    from base
    where body_type is not null
      and (_brand is null or brand_slug = _brand)
      and (_model is null or model_slug = _model)
      and (_fuels is null or fuel_type = any(_fuels))
      and (_transmissions is null or transmission = any(_transmissions) or ('auto' = any(_transmissions) and transmission is null))
      and (_regions is null or region = any(_regions))
    group by body_type
  ) t
),
regions as (
  select jsonb_agg(jsonb_build_object('value', region, 'count', c) order by c desc) as v
  from (
    select region, count(*) as c
    from base
    where region is not null
      and (_brand is null or brand_slug = _brand)
      and (_model is null or model_slug = _model)
      and (_fuels is null or fuel_type = any(_fuels))
      and (_transmissions is null or transmission = any(_transmissions) or ('auto' = any(_transmissions) and transmission is null))
      and (_body_types is null or body_type = any(_body_types))
    group by region
  ) t
)
select jsonb_build_object(
  'total', (select total from agg),
  'brands', coalesce((select v from brands), '[]'::jsonb),
  'models', coalesce((select v from models), '[]'::jsonb),
  'fuels', coalesce((select v from fuels), '[]'::jsonb),
  'transmissions', coalesce((select v from transmissions), '[]'::jsonb),
  'body_types', coalesce((select v from body_types), '[]'::jsonb),
  'regions', coalesce((select v from regions), '[]'::jsonb)
);
$$;