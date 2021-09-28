
const { debug } = require('console');
const fs = require('fs');
///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
// Warning: no type and data validation is provided
///////////////////////////////////////////////////////////////////////////
module.exports =
class Repository {
    constructor(objectsName) {
        this.objectsList = [];
        this.objectsFile = `./API_Server/data/${objectsName}.json`;
        this.read();
    }
    read() {
        try{
            // Here we use the synchronus version readFile in order
            // to avoid concurrency problems
            let rawdata = fs.readFileSync(this.objectsFile);
            // we assume here that the json data is formatted correctly
            this.objectsList = JSON.parse(rawdata);
        } catch(error) {
            if (error.code === 'ENOENT') {
                // file does not exist, it will be created on demand
                this.write();
            }
        }
    }
    write() {
        // Here we use the synchronus version writeFile in order
        // to avoid concurrency problems
        fs.writeFileSync(this.objectsFile, JSON.stringify(this.objectsList));
        this.read();
    }
    nextId() {
        let maxId = 0;
        for(let object of this.objectsList){
            if (object.Id > maxId) {
                maxId = object.Id;
            }
        }
        return maxId + 1;
    }
    add(object) {
        try {
            object.Id = this.nextId();
            this.objectsList.push(object);
            this.write();
            return object;
        } catch(error) {
            return null;
        }
    }
    getAll() {
        return this.objectsList;
    }
    get(id){
        for(let object of this.objectsList){
            if (object.Id === id) {
               return object;
            }
        }
        return null;
    }
    getParams(){
        return ["sort", "id", "name", "category"];
    }
    getName(name){
        if (name.substring(name.length - 1) === "*"){
            let newObjectList = [];
            name = name.substring(0, name.length - 1);
            for(let object of this.objectsList){
                let formatedString = object.Name.toLowerCase().substring(0, name.length)
                if (formatedString === name) {
                   newObjectList.push(object);
                }
            }
            if (newObjectList.length > 0){
                return newObjectList;
            }
        }else{
            for(let object of this.objectsList){
                if (object.Name.toLowerCase() === name) {
                   return object;
                }
            }
        }
        return null;
    }
    getNameMultiple(name, objList){
        if (name.substring(name.length - 1) === "*"){
            let newObjectList = [];
            name = name.substring(0, name.length - 1);
            for(let object of objList){
                let formatedString = object.Name.toLowerCase().substring(0, name.length)
                if (formatedString === name) {
                   newObjectList.push(object);
                }
            }
            if (newObjectList.length > 0){
                return newObjectList;
            }
        }else{
            for(let object of objList){
                if (object.Name.toLowerCase() === name) {
                   return object;
                }
            }
        }
        return null;
    }
    getCategory(category){
        let newObjectList = [];
        for(let object of this.objectsList){
            if (object.Category.toLowerCase() === category) {
                newObjectList.push(object);
            }
        }
        return newObjectList.length > 0 ? newObjectList : null;
    }
    getCategoryMultiple(category, objList){
        let newObjectList = [];
        for(let object of objList){
            if (object.Category.toLowerCase() === category) {
                newObjectList.push(object);
            }
        }
        return newObjectList.length > 0 ? newObjectList : null;
    }
    sortName(){
        let objectLength = this.objectsList.length;
        let temp;
        for (let i = 0; i < objectLength - 1; i++){
            for (let j = i + 1; j < objectLength; j++){
                if (this.objectsList[i].Name > this.objectsList[j].Name){
                    temp = this.objectsList[i];
                    this.objectsList[i] = this.objectsList[j];
                    this.objectsList[j] = temp;
                }
            }
        }
        return this.objectsList;
    }
    sortNameMultiple(objList){
        let objectLength = objList.length;
        let temp;
        for (let i = 0; i < objectLength - 1; i++){
            for (let j = i + 1; j < objectLength; j++){
                if (objList[i].Name > objList[j].Name){
                    temp = objList[i];
                    objList[i] = objList[j];
                    objList[j] = temp;
                }
            }
        }
        return objList;
    }
    sortCategory(){
        let objectLength = this.objectsList.length;
        let temp;
        for (let i = 0; i < objectLength - 1; i++){
            for (let j = i + 1; j < objectLength; j++){
                if (this.objectsList[i].Category > this.objectsList[j].Category){
                    temp = this.objectsList[i];
                    this.objectsList[i] = this.objectsList[j];
                    this.objectsList[j] = temp;
                }
            }
        }
        return this.objectsList;
    }
    sortCategoryMultiple(objList){
        let objectLength = objList.length;
        let temp;
        for (let i = 0; i < objectLength - 1; i++){
            for (let j = i + 1; j < objectLength; j++){
                if (objList[i].Category > objList[j].Category){
                    temp = objList[i];
                    objList[i] = objList[j];
                    objList[j] = temp;
                }
            }
        }
        return objList;
    }
    remove(id) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === id) {
                this.objectsList.splice(index,1);
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
    update(objectToModify) {
        let index = 0;
        for(let object of this.objectsList){
            if (object.Id === objectToModify.Id) {
                this.objectsList[index] = objectToModify;
                this.write();
                return true;
            }
            index ++;
        }
        return false;
    }
}