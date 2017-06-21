Contact MPs
===========================

This is a project intended to make it easier to contact Members of Parliament.

Two campaigns are currently run on dedicated instances: psam and newsmedia.

## Principles

- The public should learn that they are directly represented by MPs via constituency time, and can easily contact their MPs
- It should be as quick and easy as possible to contact your MP for legitimate relevant conversation
- Embedding is important for distribution, especially via online news outlets
  - When embedded, in-site navigation happens inside the iframe. So when you send a message, the content of the iframe changes to the next page. The parent doesn't change.
  - Watch out! Links that should not load inside the iframe should set the target to _blank or _parent
  - The home page (/) embeds the default campaign message creation page. This helps ensure we thoroughly test embedding
  - The whole site must also work non-embedded! Social sharing links link directly to the current page which means visitors will see that, not the parent (e.g. the news article or whatever that embedded it)
- Sharing on social media and mobile chat apps like WhatsApp is another important marketing mechanism
  - Allowing users to share pages with relevant, personal OG metadata improves the quality of this
- Athough they are publicly accessible if you know the URL, It shouldn't be trivial to iterate through all the sent messages.
  - Users and MPs should get to choose whether they share it and where
  - Search engines shouldn't index them
  - We use secure random email IDs to be difficult to guess, but anyone who knows the secure ID can view it.

## Embed examples

- [Standard embed code](https://jsfiddle.net/jbothma_openup/mdu1dfzp/1/)
- [Embedded result](https://jsfiddle.net/jbothma_openup/1ommh6qn/4/)

## Data updates

Member of Parliament data is downloaded from [People's Assembly](pa.org.za).

You can manually download the data and update the database with
```
python manage.py loadpa
```

You can manually update the database from a file on the server using
```
python manage.py loadpa --file=path/to/pombola.json
```

Setting up dev env
-----------------------

```
virtualenv --no-site-packages env
source env/bin/activate
pip install -r requirements.txt
```

```
$ sudo su postgres
$ psql
postgres=# create role contactmps;
CREATE ROLE
postgres=# alter role contactmps login;
ALTER ROLE
postgres=# create database contactmps owner contactmps;
CREATE DATABASE
postgres=#
```

Allow passwordless database connections locally, or give your DB user a password
and set the DATABASE_URL environment variable accordingly.

Set the following environment variables:

```
RECAPTCHA_KEY=...
RECAPTCHA_SECRET=...
```

Initialise and run.

```
python manage.py migrate
python manage.py createsuperuser
export RECAPTCHA_KEY=...
export RECAPTCHA_SECRET=...
CAMPAIGN=psam python manage.py runserver
```

Development
------------------

* Put javascript into ``contactmps/static/javascript/app.js``
* Put SCSS stylesheets into ``contactmps/static/stylesheets/app.scss``
* Install new asset packs with Bower: ``bower install -Sp package-to-install``
* Get better debugging with ``python manage.py runserver_plus``


Production deployment
---------------------

Production deployment assumes you're running on Heroku.

You will need:

* a django secret key
* a New Relic license key

```bash
dokku config:set  DJANGO_DEBUG=false \
                  DISABLE_COLLECTSTATIC=1 \
                  DJANGO_SECRET_KEY=some-secret-key \
                  NEW_RELIC_APP_NAME=cool app name \
                  NEW_RELIC_LICENSE_KEY=new relic license key \
                  DJANGO_EMAIL_HOST_PASSOWRD=the sendgrind password \
                  DJANGO_SEND_EMAILS=True \
                  RECAPTCHA_KEY=... \
                  RECAPTCHA_SECRET=... \
                  BASE_URL=https://production.url.com \
                  CAMPAIGN=...
git push dokku master

To disable caching, set the environment variable ```DJANGO_DISABLE_CACHE=True```
```

## Nightly data updates

Looks like People's Assembly produces a dump around 01:30 GMT so set a cron job for around 02:00 GMT
```
0 0 0 0 0 dokku run --rm ...
```

License
-------

MIT License
