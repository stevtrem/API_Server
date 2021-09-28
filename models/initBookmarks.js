exports.initBookmarks = function (){
    const BookmarksRepository = require('./Repository.js');
    const Bookmark = require('./Bookmark');
    const bookmarksRepository = new BookmarksRepository("bookmarks");
    bookmarksRepository.add(new Bookmark('Reddit','https://www.reddit.com/','Social'));
    bookmarksRepository.add(new Bookmark('IGN','https://www.ign.com/ca','Technologie')); 
    bookmarksRepository.add(new Bookmark('Google','https://www.google.com/','Recherche'));
    bookmarksRepository.add(new Bookmark('Facebook','https://www.facebook.com/','Social'));
    bookmarksRepository.add(new Bookmark('Twitch','https://www.twitch.tv/','Divertissement'));
    bookmarksRepository.add(new Bookmark('Twitter','https://www.twitter.com/','Social'));
    // bookmarksRepository.add({
    //     Id : 0,
    //     Name: 'Google',
    //     Url: 'https://www.google.com/',
    //     Category: 'Moteur de recherche'
    //   });
    //   bookmarksRepository.add({
    //     Id : 0,
    //     Name: 'IGN',
    //     Url: 'https://www.ign.com/ca',
    //     Category: 'Technologie'
    // });
}