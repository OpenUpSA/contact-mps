Contact MPs
===========================

This is a project intended to make it easier to contact Members of Parliament.

## Data updates

Member of Parliament data is downloaded from (People's Assembly)[pa.org.za].

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

```
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
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
                  RECAPTCHA_SECRET=...
git push dokku master
```

## Nightly data updates

Looks like People's Assembly produces a dump around 01:30 GMT so set a cron job for around 02:00 GMT
```
0 0 0 0 0 dokku run --rm ...
```

License
-------

MIT License
