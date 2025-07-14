create table if not exists rate_limits (
  id serial primary key,
  identifier text not null,
  count int not null default 1,
  last_request timestamp with time zone not null,
  unique(identifier)
); 