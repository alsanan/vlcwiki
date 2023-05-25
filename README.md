# vlcwiki
Minimal wiki engine

Minimal structure for a set of html files being part of a wiki. Every page includes a link to a CSS and a JS file. The JS manages the right workings, just draws the menu of the wiki and manages minimal authentication in order to enter editing mode. Saving and listing goes througn a api.php file. The wiki page is converted automatically to markdown while editing and reconverted to HTML when saved so it can be accessed statically (it's impossible to access faster than static files).
