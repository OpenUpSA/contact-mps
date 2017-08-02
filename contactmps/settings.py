"""
Django settings for Contact-MPs

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

BASE_URL = os.environ.get('BASE_URL', 'http://localhost:8000')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'true') == 'true'

# SECURITY WARNING: keep the secret key used in production secret!
if DEBUG:
    SECRET_KEY = '-r&cjf5&l80y&(q_fiidd$-u7&o$=gv)s84=2^a2$o^&9aco0o'
else:
    SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

if DEBUG:
    HOME_CAMPAIGN = os.environ.get('HOME_CAMPAIGN', 'natrepresentation')
else:
    HOME_CAMPAIGN = os.environ.get('HOME_CAMPAIGN')

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'pipeline',
    'django_extensions',

    'contactmps',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'contactmps.middleware.RedirectMiddleware',
)

ROOT_URLCONF = 'contactmps.urls'

WSGI_APPLICATION = 'contactmps.wsgi.application'

SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases
import dj_database_url
db_config = dj_database_url.config(default='postgres://contactmps@localhost:5432/contactmps')
db_config['ATOMIC_REQUESTS'] = True
DATABASES = {
    'default': db_config,
}

# Caches
DISABLE_CACHE = os.environ.get('DJANGO_DISABLE_CACHE', False) == 'True'

if DEBUG or DISABLE_CACHE:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
            'LOCATION': '/var/tmp/django_cache',
        }
    }

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'contactmps.context_processors.general',
                'contactmps.context_processors.is_mobile',
            ],
        },
    },
]


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

ASSETS_DEBUG = DEBUG
ASSETS_URL_EXPIRE = False

# assets must be placed in the 'static' dir of your Django app

# where the compiled assets go
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# the URL for assets
STATIC_URL = '/static/'

STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
    "pipeline.finders.PipelineFinder",
)

PYSCSS_LOAD_PATHS = [
    os.path.join(BASE_DIR, 'contactmps', 'static'),
    os.path.join(BASE_DIR, 'contactmps', 'static', 'bower_components'),
]

PIPELINE = {
    'PIPELINE_ENABLED': not DEBUG,
    'PIPELINE_COLLECTOR_ENABLED': True,
    'JAVASCRIPT': {
        'js-newsmedia': {
            'source_filenames': (
                'bower_components/jquery/dist/jquery.min.js',
                'javascript/pym.v1.min.js',
                'javascript/base.js',
                'javascript/select2.min.js',
                'bower_components/mustache.js/mustache.js',
                'javascript/newsmedia.js',
            ),
            'output_filename': 'newsmedia.js',
        },
        'js-psam': {
            'source_filenames': (
                'bower_components/jquery/dist/jquery.min.js',
                'javascript/pym.v1.min.js',
                'javascript/base.js',
                'javascript/select2.min.js',
                'bower_components/mustache.js/mustache.js',
                'javascript/psam.js',
            ),
            'output_filename': 'psam.js',
        },
        'js-secretballot': {
            'source_filenames': (
                'bower_components/jquery/dist/jquery.min.js',
                'javascript/pym.v1.min.js',
                'javascript/base.js',
                'javascript/secretballot.js',
            ),
            'output_filename': 'secretballot.js',
        },
        'js-natrepresentation': {
            'source_filenames': (
                'bower_components/jquery/dist/jquery.min.js',
                'javascript/pym.v1.min.js',
                'javascript/base.js',
                'javascript/natrepresentation.js',
            ),
            'output_filename': 'natrepresentation.js',
        },
    },
    'STYLESHEETS': {
        'css-newsmedia': {
            'source_filenames': (
                'bower_components/fontawesome/css/font-awesome.css',
                'stylesheets/select2.min.css',
                'stylesheets/newsmedia.scss',
            ),
            'output_filename': 'newsmedia.css',
        },
        'css-psam': {
            'source_filenames': (
                'bower_components/fontawesome/css/font-awesome.css',
                'stylesheets/select2.min.css',
                'stylesheets/psam.scss',
            ),
            'output_filename': 'psam.css',
        },
        'css-secretballot': {
            'source_filenames': (
                'stylesheets/secretballot.scss',
            ),
            'output_filename': 'secretballot.css',
        },
        'css-natrepresentation': {
            'source_filenames': (
                'stylesheets/natrepresentation.scss',
            ),
            'output_filename': 'natrepresentation.css',
        },
        'container': {
            'source_filenames': (
                'stylesheets/container.scss',
            ),
            'output_filename': 'container.css',
        },
    },
    'CSS_COMPRESSOR': None,
    'JS_COMPRESSOR': None,
    'DISABLE_WRAPPER': True,
    'COMPILERS': (
        'contactmps.pipeline.PyScssCompiler',
    ),
}

# Simplified static file serving.
# https://warehouse.python.org/project/whitenoise/
STATICFILES_STORAGE = 'contactmps.pipeline.GzipManifestPipelineStorage'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'simple': {
            'format': '%(asctime)s %(levelname)s %(module)s %(process)d %(thread)d %(message)s'
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        }
    },
    'root': {
        'handlers': ['console'],
        'level': 'ERROR'
    },
    'loggers': {
        # put any custom loggers here
        # 'your_package_name': {
        #    'level': 'DEBUG' if DEBUG else 'INFO',
        # },
        'django': {
            'level': 'DEBUG' if DEBUG else 'INFO',
        },
        'contactmps': {
            'level': 'DEBUG' if DEBUG else 'INFO',
        },
    }
}

# Redirect www.foo.com to foo.com? This is the reverse of Django's PREPEND_WWW
STRIP_WWW = True

EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_HOST_USER = 'code4sa-general'
EMAIL_HOST_PASSWORD = os.environ.get('DJANGO_EMAIL_HOST_PASSWORD')
EMAIL_PORT = 587

# use this to stop sending emails
SEND_EMAILS = os.environ.get('DJANGO_SEND_EMAILS') == 'True'

if DEBUG:
    RECAPTCHA_KEY = os.environ.get('RECAPTCHA_KEY', '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI')
    RECAPTCHA_SECRET = os.environ.get('RECAPTCHA_SECRET', '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe')
else:
    RECAPTCHA_KEY = os.environ.get('RECAPTCHA_KEY')
    RECAPTCHA_SECRET = os.environ.get('RECAPTCHA_SECRET')
