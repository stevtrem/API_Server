const Repository = require("../models/Repository")
const expression = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const regex = new RegExp(expression);

module.exports =
class BookmarksController extends require("./Controller"){
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository("bookmarks")
    }
    getAll(){
        this.response.JSON(this.bookmarksRepository.getAll());
    }
    get(id){
        if(!isNaN(id))
            this.response.JSON(this.bookmarksRepository.get(id));
        else
            this.response.JSON(this.bookmarksRepository.getAll());
    }
    getParams(){
        this.response.JSON(this.bookmarksRepository.getParams());
    }
    getMultipleParams(params){
        let newObjectList = this.bookmarksRepository.getAll();
        for (let type of params){
            let data = type.split("=");
            switch(data[0]){
                case "sort":
                    if (data[1] === "name")
                        newObjectList = this.bookmarksRepository.sortNameMultiple(newObjectList);
                    else if (data[1] === "category")
                        newObjectList = this.bookmarksRepository.sortCategoryMultiple(newObjectList);
                break;
                case "name":
                    newObjectList = this.bookmarksRepository.getNameMultiple(data[1], newObjectList);
                break;
                case "category":
                    newObjectList = this.bookmarksRepository.getCategoryMultiple(data[1], newObjectList);
                break;
            }
        }
        this.response.JSON(newObjectList);
    }
    getName(name){
        this.response.JSON(this.bookmarksRepository.getName(name));
    }
    getCategory(category){
        this.response.JSON(this.bookmarksRepository.getCategory(category));
    }
    sort(key){
        if (key === "name"){
            this.response.JSON(this.bookmarksRepository.sortName())
        }else if (key === "category"){
            this.response.JSON(this.bookmarksRepository.sortCategory());
        }
    }
    post(bookmark){  
        if (this.bookmarksRepository.getName(bookmark.Name) === null && bookmark.Name !== ""){
            if (bookmark.Url.match(regex) && bookmark.Category !== ""){
                let newBookmark = this.bookmarksRepository.add(bookmark);
                if (newBookmark)
                    this.response.created(JSON.stringify(newBookmark));
                else
                    this.response.internalError();
            }else{
                this.response.internalError();
            }
        }else{
            this.response.internalError();
        }
    }
    put(bookmark){
        if (bookmark.Name !== "" && bookmark.Url.match(regex) && bookmark.Category !== ""){
            if (this.bookmarksRepository.update(bookmark))
                this.response.ok();
            else 
                this.response.notFound();
        }else{
            this.response.internalError();
        }
    }
    remove(id){
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }

}