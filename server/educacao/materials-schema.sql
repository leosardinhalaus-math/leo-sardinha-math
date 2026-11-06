-- Setup for the reserved teacher-materials service. No real accounts or files.
-- Inspect the target project before applying. Not a change to a game schema.
begin;
create table public.education_materials (
 id uuid primary key,
 title text not null check (char_length(title) between 3 and 120),
 description text not null default '' check (char_length(description)<=1200),
 school_year text not null default '' check (char_length(school_year)<=100),
 math_topics text not null default '' check (char_length(math_topics)<=200),
 status text not null default 'draft' check (status in ('draft','published')),
 object_key text not null unique check (object_key=id::text||'.pdf'),
 byte_size integer not null check (byte_size between 1 and 5242880),
 sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
 revision integer not null default 1 check (revision>0),
 created_at timestamptz not null default now(),
 published_at timestamptz,
 check ((status='draft' and published_at is null) or (status='published' and published_at is not null))
);
create index education_materials_catalog on public.education_materials (created_at desc,id desc);
create index education_materials_published on public.education_materials (created_at desc,id desc) where status='published';
alter table public.education_materials enable row level security;
alter table public.education_materials force row level security;
create policy education_materials_no_browser_access on public.education_materials
 for all to anon,authenticated using (false) with check (false);
revoke all on public.education_materials from public,anon,authenticated;
grant select,insert,update,delete on public.education_materials to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('education-teacher-materials','education-teacher-materials',false,5242880,array['application/pdf']);
-- Restrictive policy protects this bucket even if other buckets have broad policies.
create policy education_materials_server_only on storage.objects as restrictive
 for all to anon,authenticated
 using (bucket_id<>'education-teacher-materials')
 with check (bucket_id<>'education-teacher-materials');
commit;
