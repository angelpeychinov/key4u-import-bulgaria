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
set statement_timeout = '15s'
as $$
select jsonb_build_object(
  'total', (
    select count(*) from public.encar_listings l
    where l.status = 'active'
      and (_brand is null or l.brand_slug = _brand)
      and (_model is null or l.model_slug = _model)
      and (_year_from is null or l.year >= _year_from)
      and (_year_to is null or l.year <= _year_to)
      and (_price_min is null or l.price_original >= _price_min)
      and (_price_max is null or l.price_original <= _price_max)
      and (_mileage_min is null or l.mileage >= _mileage_min)
      and (_mileage_max is null or l.mileage <= _mileage_max)
      and (_fuels is null or l.fuel_type = any(_fuels))
      and (_transmissions is null or l.transmission = any(_transmissions) or ('auto' = any(_transmissions) and l.transmission is null))
      and (_body_types is null or l.body_type = any(_body_types))
      and (_regions is null or l.region = any(_regions))
      and (not _no_accident or l.has_accident = false)
  ),
  'brands', coalesce((
    select jsonb_agg(jsonb_build_object('slug', t.brand_slug, 'name', t.brand_name, 'count', t.c) order by t.c desc)
    from (
      select l.brand_slug, max(l.brand_name) as brand_name, count(*) as c
      from public.encar_listings l
      where l.status = 'active'
        and (_year_from is null or l.year >= _year_from)
        and (_year_to is null or l.year <= _year_to)
        and (_price_min is null or l.price_original >= _price_min)
        and (_price_max is null or l.price_original <= _price_max)
        and (_mileage_min is null or l.mileage >= _mileage_min)
        and (_mileage_max is null or l.mileage <= _mileage_max)
        and (_fuels is null or l.fuel_type = any(_fuels))
        and (_transmissions is null or l.transmission = any(_transmissions) or ('auto' = any(_transmissions) and l.transmission is null))
        and (_body_types is null or l.body_type = any(_body_types))
        and (_regions is null or l.region = any(_regions))
        and (not _no_accident or l.has_accident = false)
      group by l.brand_slug
    ) t
  ), '[]'::jsonb),
  'models', coalesce((
    select jsonb_agg(jsonb_build_object('slug', t.model_slug, 'name', t.model_name, 'count', t.c) order by t.c desc)
    from (
      select l.model_slug, max(l.model_name) as model_name, count(*) as c
      from public.encar_listings l
      where l.status = 'active'
        and (_brand is null or l.brand_slug = _brand)
        and l.model_slug is not null
        and (_year_from is null or l.year >= _year_from)
        and (_year_to is null or l.year <= _year_to)
        and (_price_min is null or l.price_original >= _price_min)
        and (_price_max is null or l.price_original <= _price_max)
        and (_mileage_min is null or l.mileage >= _mileage_min)
        and (_mileage_max is null or l.mileage <= _mileage_max)
        and (_fuels is null or l.fuel_type = any(_fuels))
        and (_transmissions is null or l.transmission = any(_transmissions) or ('auto' = any(_transmissions) and l.transmission is null))
        and (_body_types is null or l.body_type = any(_body_types))
        and (_regions is null or l.region = any(_regions))
        and (not _no_accident or l.has_accident = false)
      group by l.model_slug
    ) t
  ), '[]'::jsonb),
  'fuels', coalesce((
    select jsonb_agg(jsonb_build_object('value', t.fuel_type, 'count', t.c) order by t.c desc)
    from (
      select l.fuel_type, count(*) as c
      from public.encar_listings l
      where l.status = 'active'
        and l.fuel_type is not null
        and (_brand is null or l.brand_slug = _brand)
        and (_model is null or l.model_slug = _model)
        and (_year_from is null or l.year >= _year_from)
        and (_year_to is null or l.year <= _year_to)
        and (_price_min is null or l.price_original >= _price_min)
        and (_price_max is null or l.price_original <= _price_max)
        and (_mileage_min is null or l.mileage >= _mileage_min)
        and (_mileage_max is null or l.mileage <= _mileage_max)
        and (_transmissions is null or l.transmission = any(_transmissions) or ('auto' = any(_transmissions) and l.transmission is null))
        and (_body_types is null or l.body_type = any(_body_types))
        and (_regions is null or l.region = any(_regions))
        and (not _no_accident or l.has_accident = false)
      group by l.fuel_type
    ) t
  ), '[]'::jsonb),
  'transmissions', coalesce((
    select jsonb_agg(jsonb_build_object('value', t.tr, 'count', t.c) order by t.c desc)
    from (
      select coalesce(l.transmission, 'auto') as tr, count(*) as c
      from public.encar_listings l
      where l.status = 'active'
        and (_brand is null or l.brand_slug = _brand)
        and (_model is null or l.model_slug = _model)
        and (_year_from is null or l.year >= _year_from)
        and (_year_to is null or l.year <= _year_to)
        and (_price_min is null or l.price_original >= _price_min)
        and (_price_max is null or l.price_original <= _price_max)
        and (_mileage_min is null or l.mileage >= _mileage_min)
        and (_mileage_max is null or l.mileage <= _mileage_max)
        and (_fuels is null or l.fuel_type = any(_fuels))
        and (_body_types is null or l.body_type = any(_body_types))
        and (_regions is null or l.region = any(_regions))
        and (not _no_accident or l.has_accident = false)
      group by 1
    ) t
  ), '[]'::jsonb),
  'body_types', coalesce((
    select jsonb_agg(jsonb_build_object('value', t.body_type, 'count', t.c) order by t.c desc)
    from (
      select l.body_type, count(*) as c
      from public.encar_listings l
      where l.status = 'active'
        and l.body_type is not null
        and (_brand is null or l.brand_slug = _brand)
        and (_model is null or l.model_slug = _model)
        and (_year_from is null or l.year >= _year_from)
        and (_year_to is null or l.year <= _year_to)
        and (_price_min is null or l.price_original >= _price_min)
        and (_price_max is null or l.price_original <= _price_max)
        and (_mileage_min is null or l.mileage >= _mileage_min)
        and (_mileage_max is null or l.mileage <= _mileage_max)
        and (_fuels is null or l.fuel_type = any(_fuels))
        and (_transmissions is null or l.transmission = any(_transmissions) or ('auto' = any(_transmissions) and l.transmission is null))
        and (_regions is null or l.region = any(_regions))
        and (not _no_accident or l.has_accident = false)
      group by l.body_type
    ) t
  ), '[]'::jsonb),
  'regions', coalesce((
    select jsonb_agg(jsonb_build_object('value', t.region, 'count', t.c) order by t.c desc)
    from (
      select l.region, count(*) as c
      from public.encar_listings l
      where l.status = 'active'
        and l.region is not null
        and (_brand is null or l.brand_slug = _brand)
        and (_model is null or l.model_slug = _model)
        and (_year_from is null or l.year >= _year_from)
        and (_year_to is null or l.year <= _year_to)
        and (_price_min is null or l.price_original >= _price_min)
        and (_price_max is null or l.price_original <= _price_max)
        and (_mileage_min is null or l.mileage >= _mileage_min)
        and (_mileage_max is null or l.mileage <= _mileage_max)
        and (_fuels is null or l.fuel_type = any(_fuels))
        and (_transmissions is null or l.transmission = any(_transmissions) or ('auto' = any(_transmissions) and l.transmission is null))
        and (_body_types is null or l.body_type = any(_body_types))
        and (not _no_accident or l.has_accident = false)
      group by l.region
    ) t
  ), '[]'::jsonb)
);
$$;