https://github.com/realsporkman/aquatic-mp


Welcome to the Aquatic Media Player package!

This is a simple web-based interface for playing your local on-disk music and videos. It is implemented in javascript, and supports any media format that your browser supports when wrapped in the html &lt;audio&gt; and &lt;video&gt; tags

Setup requires running a script, "build_db", to build the database for the application. "build_db" is located under the aquatic-mp-master package directory. This process requires that the "nodejs", "ffprobe", and "indentify" commands be installed and in your path environment. In debian-based distros, this requires installing these packages:

  sudo apt install nodejs ffmpeg imagemagick

Similar packages in macOS can be obtained through the "Homebrew" OSS package manager.

Once the database is built using the "aquatic-mp-master/build_db" script, launch Aquatic by loading this file in your browser:

  &lt;...path to install...&gt;/aquatic-mp-master/www/index.html

For best results we recommend using the Chrome web browser launched in "app" mode:

  google-chrome --app="file://&lt;...path to install...&gt;/aquatic-mp-master/www/index.html"

Be sure to check out the built-in aquarium!

Enjoy your new smooth-listening experience.

