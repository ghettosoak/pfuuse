# Frontiere v2

Buildsystem unashamedly taken from here: https://github.com/maxomedia/mxm-gulp
Phillip Gfeller is a beast. Go learn more about him here: https://github.com/tuelsch

## Let's rock

1. CD into the _gulp directory
2. run npm install
3. get a coffee, there's a lot to download
4. it'll probably throw an error, ignore and run npm install again
5. done? run gulp
6. boogie

## Requires:
- node v-Whatever
- a thirst for blood
- 

## Includes:

- Most of bootstrap, because bower is for suckers
- jQuery v1.11.1 because ie8 isn't dead yet (at least in switzerland)
- Chosen v1.4.2 because selectize && select2 don't play nice with browserify and npm is a bit overkill for frontend (see above thoughts on bower)
 - some super basic styles to get you up and running; I'll leave making it sing up to you
- More empty folders than you can shake a stick at
- A folder full(-ish) of useful commonly seen HTML structures (&& their applicable JS / CSS)
 - folder is called '_structures'
 - Said HTML / JS is commented out
 - Please feel free to delete / use as you please
 - if you happen edit any of the JS files in shared (outside of core), think about moving it into modules

## Known issues:
- Sometimes gulp needs to be restarted to properly accept SVG files
- SVG paths MUST be compound paths, otherwise gulp will cry
 - cmd / ctrl + 8 in illustrator
- having problems with your font files loading? try making your paths a couple times larger

# JS files in Shared

## Funny Money ($$_ / core.js)
right now, this is called 'core.js', but it might be broadened into its own library. in essence, it is a bunch of functions I find myself reusing over and over again, so rather than keep piecemealing it from other projects, the most important parts have found their way here.
- thanks to browserify, its prefix is &&_
 - as such, new modules are expected to be included per browserify
- it is completely interchangeable – don't like something? get rid of it
- instead of including an entire library, you can pick and choose what you want, and reference it a little bit quicker (not to mention a bit more modular with browserify). as such, it is designed to supplant the following:
 - modernizr
 - underscore
 - yes, I am that kind of arrogant, deal with it
- a couple function-specific notes in lieu of proper documentation
 - mediaQueriesSupported requires a CSS one liner, can be found in general.less
 - if you need to calculate your media query AFTER something is setup (eg, flexslider, etc), simply subscribe $$_.mediaQuery's initial calculate call to the pageSetup function
 - Define your the height of your sticky header in the $$_.scrollToHere function

### img.js
this is my answer to responsive images. the path(s) are written into data attributes, and working in tandem the funny money library, only loads the required images as needed, as the page resizes. sweet!

### parallax.js
you want parallax images? I got your parallaxed images right here. it depends on background images, and tries its damndest to resize everything as appropriately as possible.
 - requires a CSS one liner (for #img_stage), can be found in general.less

### map.js
here are the basic constructors for google maps. set up a map, a marker and an infowindow. it expects coordinates to be encoded into data attributes. if you want more points, you should be able to expand it as needed.


# TODO:

- off canvas mobile navigation
 - that can remember where you were when you opened it!
 - that opens and closes around the user's selection (subnav)

- image slider, a la slick

- styleguide integration :c

- textarea counts characters
