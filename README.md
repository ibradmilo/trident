# New Project Base

This project is set up on the standard project base. Put project specific README info here.

## Development Environment
Vagrant is configured for this project. This requires Vagrant >= 1.6, the  [hostsupdater plugin](https://github.com/the-andrew/vagrant-hostsupdater), and the [bindfs plugin](https://github.com/gael-ian/vagrant-bindfs). For more instructions on installing Vagrant, read [this guide](https://milodigital.atlassian.net/wiki/display/KB/Getting+Started).

#### Getting Started & Using Vagrant
Open Terminal, `cd` into the project directory and run `vagrant up`. The VM will boot, provision itself automatically and will print out the configured hosts (e.g. local.domain.com).

For more instructions on configuring the software stack, adding additional virtual hosts, changing PHP ini, managing DBs, and installing Wordpress see Vagrant/prov-helpers/puppet/hiera/SAMPLE_site.yaml.

#### Software Stack
The following configurations are available:
* PHP 5.3 (suPHP), Apache, MySQL
* PHP 5.6 (PHP-FPM), Apache (FastCGI), MySQL

The following commands run on every `up` and `provision`:
* __Composer__ - `composer install` runs in /deploy
* __Bower__ - `bower install` runs in /deploy
* __Compass__ - `compass watch` runs in /deploy
* __Ruby Gems__ (Gemfile) - `bundle install` runs in /
* __NPM__ - `npm install` runs in /deploy 
* __Grunt__ - `grunt -f` runs in /deploy 

#### Connecting to MySQL
By default, a single database is created and the name and user credentials will be set in deploy/.env.php. Include that file from the site/app to read the credentials dynamically. Do not hardcode them into committed source files.

If you'd like to connect to MySQL from a GUI app, use the VM domain (e.g. local.domain.com) and the credentials from the .env.php file.