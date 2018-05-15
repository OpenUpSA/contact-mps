Contact MPs
===========

This is a project intended to make it easier to contact Members of Parliament.

Multiple campaigns can run on the same instance.

The campaign shown on the home page is the campaign related to the [Django Site](https://docs.djangoproject.com/en/2.0/ref/contrib/sites/)

Other campaigns can be viewed at `https://hostname/campaign/...campaign-slug...`

Keep it simple
--------------

Why use this instead of Google Forms?

Use Google Forms and submit the emails as CSV using something like mailchimp if that's sufficient! That provides WYSIWYG form editing and an online spreadsheet for moderation.

What does this provide that Google Forms doesn't?

- Preview the composed letter before sending
  - useful when we use multiple questions to help construct a formal letter
- A captcha to ensure submitters aren't robots
- Customisable (relevant) Open Graph metadata on completed submissions if people want to share on social media
  - This isn't that big a deal - most of the traffic comes via news media partners and not social media.

Principles
----------

- The public should learn that they are directly represented by MPs via constituency time, and can easily contact their MPs
- It should be as quick and easy as possible to contact your MP for legitimate relevant conversation
- Embedding is important for distribution, especially via online news outlets
  - When embedded, in-site navigation happens inside the iframe. So when you send a message, the content of the iframe changes to the next page. The parent doesn't change.
  - Watch out! Links that should not load inside the iframe should set the target to _blank or _parent
  - The home page (/) embeds the campaign related to the Site identified by the hostname used to access the site. This helps ensure we thoroughly test embedding
  - The whole site must also work non-embedded! Social sharing links link directly to the current page which means visitors will see that, not the parent (e.g. the news article or whatever that embedded it)
- Sharing on social media and mobile chat apps like WhatsApp is another important marketing mechanism
  - Allowing users to share pages with relevant, personal OG metadata improves the quality of this
- Athough they are publicly accessible if you know the URL, It shouldn't be trivial to iterate through all the sent messages.
  - Users and MPs should get to choose whether they share it and where
  - Search engines shouldn't index them
  - We use secure random email IDs to be difficult to guess, but anyone who knows the secure ID can view it.

Campaigns
------

Campaigns can have a dedicated google analytics ID

Campaigns can optionally include a link to a public view of a message in the email sent to the recipient and the sender (as send confirmation).

In the Campaign in Admin (https://contactmps.openup.org.za/admin/contactmps/campaign/) you can select _Divert Emails_ which would mean all emails towards parliament for that campaign will instead go to our webapps address and not to the actual recipient. This is intended to avoid us modifying recipient email for testing and forgetting to revert it to the real address when the campaign goes live.

Setting up dev env
------------------

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

Initialise and run.

```
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Create a Django Site for `localhost` in Admin

## Development

* Install new asset packs with Bower: ``bower install -Sp package-to-install``
* Get better debugging with ``python manage.py runserver_plus``

### Campaigns

* Put javascript into ``contactmps/static/javascript/{{ campaign_slug }}.js``
* Put SCSS stylesheets into ``contactmps/static/stylesheets/{{ campaign_slug }}.scss``
* Implement a campaign page template in ``contactmps/templates/campaigns/{{ campaign_slug }}.html``
* Implement an email detail page template in ``contactmps/templates/email-detail-{{ campaign_slug }}.html``
* Add CSS and javascript to `settings.PIPELINE`: the convention is `js-{{ campaign_slug }}` and `css-{{ campaign_slug }}` which is then included by your template.
* Add an embed javascript script into ``contactmps/static/javascript/embed-{{ campaign_slug }}.js``
* Add a Campaign model instance via `/admin` with the appropriate settings for your campaign
* If your campaign needs its own domain,
  * Create a Site for your domain in Django Admin, setting the domain to something like `campaigndomainorgza`
  * Add that domain to your hosts file, pointing to the local IP were the server is running (probably 127.0.0.1)
  * Select your site as one of the campaign sites on the Campaign page in Admin
  * visit http://campaignorgza:8000 or whatever your dev domain and port is.

## Emails

As long as you don't set the environment variables `DJANGO_EMAIL_HOST_PASSOWRD` and `DJANGO_SEND_EMAILS`, you won't accidentally send in development.

### Developing email features

Run [a local mock SMTP server](http://nilhcem.com/FakeSMTP/index.html) on port 2525

And run the dev server with something like

```bash
DJANGO_SEND_EMAILS=True DJANGO_EMAIL_HOST=localhost DJANGO_EMAIL_PORT=2525 DJANGO_EMAIL_HOST_PASSWORD= python manage.py runserver
```

Production deployment
---------------------

### Embed examples

- [Standard embed code](https://jsfiddle.net/jbothma_openup/mdu1dfzp/1/)
- [Embedded result](https://jsfiddle.net/jbothma_openup/1ommh6qn/4/)

### Data updates

Member of Parliament data is downloaded from [People's Assembly](pa.org.za).

You can manually download the data and update the database with
```
python manage.py loadpa
```

You can manually update the database from a file on the server using
```
python manage.py loadpa --file=path/to/pombola.json
```

### Deployment

Production deployment assumes you're running on dokku

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
git push dokku master

To disable caching, set the environment variable ```DJANGO_DISABLE_CACHE=True```
```

Campaign domains/hostnames
----------------

Typical steps are needed for adding domains to the site:

- Point the domain to the host - currently we use noconfidencevote-lb.openup.org.za to quickly add servers if needed
- Add the hostname to dokku: `dokku domains:add contactmps mycampaigndomain.org.za`
- Enable HTTPS: `dokku letsencrypt contactmps`
- Add a Django Site for the hostname in Admin. ***There must be a Site specified for every hostname the site will be accessed over***
- Add the domain to reCAPTCHA allowed domains

Undelivered mail
----------------

```SQL
\copy (select from_name, from_email, created_at, subject, body_txt from contactmps_email where lower(to_addresses) like '%andries.nel@parliament.gov.za%') to '/home/jdb/proj/code4sa/contact-mps/undelivered-andries.nel@parliament.gov.za.csv' csv header;
```

Web Resources
-------------

### /campaign/_campaignname_/

The web view of the campaign where messages can be composed and sent

### /email/_emailsecretid_/

The public view of an email - a nice way for a sender to show to peers what they sent

API
---

### Sending an email to a member of parliament

Submit an email body and any structured data one might want to attach to the email (e.g. the answer for whether the data is allowed to be used for analysis later and published)

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
      gRecaptchaResponse: '2398f49f293fjfj20fj',
      campaign_slug: 'secretballot',
      anyData: JSON.stringify(emailData),
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
