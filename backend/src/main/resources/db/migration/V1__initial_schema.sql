create table app_user (
  id uuid primary key,
  email varchar(320) not null unique,
  display_name varchar(120) not null,
  password_hash varchar(255) not null,
  roles varchar(255) not null,
  created_at timestamptz not null default now()
);

create table profile (
  user_id uuid primary key references app_user(id) on delete cascade,
  phone varchar(32),
  program varchar(180) not null,
  declared_skills jsonb not null default '[]'::jsonb
);

create table job (
  id uuid primary key,
  owner_id uuid references app_user(id),
  title varchar(180) not null,
  organization varchar(180) not null,
  location varchar(180),
  type varchar(80),
  summary text,
  required jsonb not null default '[]'::jsonb,
  preferred jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table application (
  id uuid primary key,
  user_id uuid not null references app_user(id) on delete cascade,
  job_id uuid not null references job(id) on delete cascade,
  statement text not null,
  stage varchar(32) not null default 'Submitted',
  applied_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table document_record (
  id uuid primary key,
  user_id uuid not null references app_user(id) on delete cascade,
  title varchar(180) not null,
  verified boolean not null default false,
  uploaded_at timestamptz not null default now()
);

create index application_user_idx on application(user_id);
create index application_job_idx on application(job_id);
create index document_user_idx on document_record(user_id);
