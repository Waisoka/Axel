create table public.profiles (
                                 id uuid primary key references auth.users(id) on delete cascade,
                                 email text,
                                 display_name text,
                                 avatar_url text,
                                 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
                                    using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
                                    using (auth.uid() = id);

-- สร้าง profile อัตโนมัติเมื่อมี user ใหม่
create function public.handle_new_user()
    returns trigger
    language plpgsql
security definer set search_path = ''
as $$
begin
insert into public.profiles (id, email)
values (new.id, new.email);
return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
