Contact MPs
===========

This is a project intended to make it easier to contact Members of Parliament.

Multiple campaigns can run on the same instance. The campaign shown on the home page is determined by the HOME_CAMPAIGN environment variable.

## Principles

- The public should learn that they are directly represented by MPs via constituency time, and can easily contact their MPs
- It should be as quick and easy as possible to contact your MP for legitimate relevant conversation
- Embedding is important for distribution, especially via online news outlets
  - When embedded, in-site navigation happens inside the iframe. So when you send a message, the content of the iframe changes to the next page. The parent doesn't change.
  - Watch out! Links that should not load inside the iframe should set the target to _blank or _parent
  - The home page (/) embeds the configured `HOME_CAMPAIGN` page. This helps ensure we thoroughly test embedding
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
HOME_CAMPAIGN=psam python manage.py runserver
```

Development
------------------

* Install new asset packs with Bower: ``bower install -Sp package-to-install``
* Get better debugging with ``python manage.py runserver_plus``

## Campaigns

* Put javascript into ``contactmps/static/javascript/{{ campaign_slug }}.js``
* Put SCSS stylesheets into ``contactmps/static/stylesheets/{{ campaign_slug }}.scss``
* Implement a campaign page template in ``contactmps/templates/campaigns/{{ campaign_slug }}.html``
* Implement an email detail page template in ``contactmps/templates/email-detail-{{ campaign_slug }}.html``
* Add CSS and javascript to `settings.PIPELINE`: the convention is `js-{{ campaign_slug }}` and `css-{{ campaign_slug }}` which is then included by your template.
* Add an embed javascript script into ``contactmps/static/javascript/embed-{{ campaign_slug }}.js``
* Add a Campaign model instance via `/admin` with the appropriate settings for your campaign


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
                  HOME_CAMPAIGN=...
git push dokku master

To disable caching, set the environment variable ```DJANGO_DISABLE_CACHE=True```
```

# Undelivered mail

```SQL
\copy (select from_name, from_email, created_at, subject, body_txt from contactmps_email where lower(to_addresses) like '%andries.nel@parliament.gov.za%') to '/home/jdb/proj/code4sa/contact-mps/undelivered-andries.nel@parliament.gov.za.csv' csv header;
```

API
---

### Sending an email to a member of parliament

```javascript
var submitForm = function() {
  jQuery.ajax('/api/v1/email/', {
    type: 'POST',
    data: {
      person: 7720,
      name: 'Fred Bloggs',
      email: 'bob@dave.lala',
      body: 'Dear Baleka, stuff.',
      subject: 'Re: Secret Ballot in Vote of No Confidence in Jacob Zuma as President of the Republic',
      gRecaptchaResponse: '2398f49f293fjfj20fj'
    },
    success: function(data) {
      console.info("success", data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
    }
  });
};
```

### Submitting answers to questions

Submit answers to arbitrary questions like so, substituting email ID and sender_secret using the values returned when sending the email.

```javascript
var answer = function(question, answer) {
  jQuery.ajax('/api/v1/email/159e4b14e63eb218da5da84fa28134f9aa8453496463b595/qa/', {
    type: 'POST',
    data: {
      'question': question,
      'answer': answer,
      'sender_secret': '18a99151b30de98de0f9be6f2cc9f9f67c3367cff1359f3',
    },
    success: function(data) {
      console.info(data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown, jqXHR.responseText);
    }
  });
}
```

License
-------

MIT License
