const { render } = require("ejs");

module.exports = function(app) {
    app.get("/",function(req, res){
        res.render("index.ejs")
        });
    app.get("/about",function(req, res){
        res.render("about.ejs")
        });
    app.get("/add",function(req, res){
        defvals = new Object;
        defvals.action = "addconfirm";
        defvals.bmess = "ADD FOOD";
        defvals.fname = "flour";
        defvals.typvals = "100.0";
        defvals.typunits = "grams";
        defvals.calories = "381";
        defvals.gcarbs = "1.0";
        defvals.gfat = "1.0";
        defvals.gprotein = "9.1";
        defvals.gsalt = "0.01";
        defvals.gsugar = "0.6";
        res.render("add.ejs", {vals : defvals});
        });
    app.post("/addconfirm",function(req, res){
        defvals = new Object;
        defvals.action = "foodadded";
        defvals.bmess = "CONFIRM ?";
        defvals.fname = req.body.fname;
        defvals.typvals = req.body.typvals;
        defvals.typunits = req.body.typunits;
        defvals.calories = req.body.calories;
        defvals.gcarbs = req.body.gcarbs;
        defvals.gfat = req.body.gfat;
        defvals.gprotein = req.body.gprotein;
        defvals.gsalt = req.body.gsalt;
        defvals.gsugar = req.body.gsugar;
        res.render("add.ejs", {vals : defvals});
        });
    app.get("/search",function(req, res){
        res.render("search.ejs")
        });
    app.get("/update",function(req, res){
        // query database to get all the foods
        let sqlquery = "SELECT * FROM foods";
    
        // execute sql query
        db.query(sqlquery, (err, result) => {
        if (err) {
            res.redirect("/");
        }
        res.render("update.ejs", {availableFoods: result});
        });
    });
    app.get("/list", function(req, res) {
        // query database to get all the foods
        let sqlquery = "SELECT * FROM foods";
        //let sqlquery = "SELECT * FROM foods";
    
        // execute sql query
        db.query(sqlquery, (err, result) => {
        if (err) {
            res.redirect("/");
        }
        //console.log(result);
        res.render("list.ejs", {availableFoods: result});
        });
    });
    app.get("/search-result", function (req, res) {
        //searching in the database
        let word = ['%'+req.query.keyword+'%'];
        let sqlquery = "SELECT * FROM foods WHERE fname LIKE ?";

        // execute sql query
        db.query(sqlquery,word, (err, result) => {
            if (err) {
                return console.error("No foods found with the keyword you have entered"
                    + req.query.keyword + "error: "+ err.message);
                res.redirect("/");
            }else{
                // if no results found output a message
                if (result.length ==0) {
                    console.log("No foods found with the keyword " + req.query.keyword);
                }
                //res.render('list.ejs',{availableFoods:result});
                res.render('update.ejs',{availableFoods:result});
            }
        });
    });
    app.post("/foodadded", function (req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO foods (fname, typvals, typunits, calories, gcarbs, gfat, gprotein, gsalt, gsugar) VALUES (?,?,?,?,?,?,?,?,?)";
        // execute sql query
        let newrecord = [req.body.fname, req.body.typvals, req.body.typunits, req.body.calories, req.body.gcarbs, 
                        req.body.gfat, req.body.gprotein, req.body.gsalt, req.body.gsugar];
        db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            return console.error(err.message);
        }else
            console.log(" This food is added to database : "+ req.body.fname);
            //res.send(" This food is added to database : "+ req.body.fname);
            res.redirect("/list");
        });
    });
    app.post("/update-food",function(req, res){
        // if a valid id is passed for deletion then do that
        // else call the update-food page
        if (req.body.delete > 0) {
            // get id for record to delete
            let deleteid = [req.body.delete];

            // construct query to get just this record using
            // a select querey
            let sqlquery = "SELECT * FROM foods WHERE id=?";

            // execute query and display on dlete page for confirmation
            db.query(sqlquery, deleteid, (err, result) => {
            if (err) {
                res.redirect("/");
            }
                // render the delete-food page to confirm
                res.render("delete-food.ejs", {availableFoods: result});
            });

        } else {
            // if there is no id to be updated
            // redirect to update
            if (req.body.update > 0) {
                // display the data on the update-food page
                let updateid = [req.body.update];

                // execute querey for food item with given id
                let sqlquery = "SELECT * FROM foods WHERE id=?";

                // execute sql query
                db.query(sqlquery, updateid, (err, result) => {
                if (err) {
                    res.redirect("/");
                }
                // display update food page
                res.render("update-food.ejs", {availableFoods: result});
                });
            } else {
                res.redirect("/update");
            }
        }
    });
    app.post("/deleted",function(req, res){
        // if a valid id is passed for deletion then do that
        // else call the update-food page
        if (req.body.id > 0) {
            // get id for record to delete
            let deleteid = [req.body.id];
            console.log(deleteid);

            // construct query to get just this record using
            // a select querey
            let sqlquery = "DELETE FROM foods WHERE id=?";

            // execute query to delete record
            db.query(sqlquery, deleteid, (err, result) => {
                console.log(err);
                if (err) {
                    res.redirect("/");
                }
                // refresh update page by calling again            
                res.redirect("/list");
                console.log("Food has been deleted form the database");
            });
        } else {
            // if there is no id to be updated
            // redirect back to update
            res.redirect("/update");
        }
    });
    app.post("/foodupdated", function (req,res) {
        // saving data in database
        // get data from response for check boxes
        // for every column construct the update record and the set string
        let updrecord = [];
        let sqlquery = "SET ";
        let spacer = '';
        if (req.body.cbfname == 'on') {
            updrecord.push(req.body.fname);
            sqlquery = sqlquery + 'fname = ? ';
            spacer = ',';
        }
        if (req.body.cbtypvals == 'on') {
            updrecord.push(req.body.typvals);
            sqlquery = sqlquery + spacer + 'typvals = ? ';
            spacer = ',';
        }
        if (req.body.cbtypunits == 'on') {
            updrecord.push(req.body.typunits);
            sqlquery = sqlquery + spacer + 'typunits = ? ';
            spacer = ',';
        }
        if (req.body.cbcalories == 'on') {
            updrecord.push(req.body.calories);
            sqlquery = sqlquery + spacer + 'calories = ? ';
            spacer = ',';
        }
        if (req.body.cbgcarbs == 'on') {
            updrecord.push(req.body.gcarbs);
            sqlquery = sqlquery + spacer + 'gcarbs = ? ';
            spacer = ',';
        }
        if (req.body.cbgfat == 'on') {
            updrecord.push(req.body.gfat);
            sqlquery = sqlquery + spacer + 'gfat = ? ';
            spacer = ',';
        }
        if (req.body.cbgprotein == 'on') {
            updrecord.push(req.body.gprotein);
            sqlquery = sqlquery + spacer + 'gprotein = ? ';
            spacer = ',';
        }
        if (req.body.cbgsalt == 'on') {
            updrecord.push(req.body.gsalt);
            sqlquery = sqlquery + spacer + 'gsalt = ? ';
            spacer = ',';
        }
        if (req.body.cbgsugar == 'on') {
            updrecord.push(req.body.gsugar);
            sqlquery = sqlquery + spacer + 'gsugar = ? '
        }
        sqlquery = 'UPDATE foods ' + sqlquery + ' WHERE id = ?';
        updrecord.push(req.body.id);

        //now execute querey to update this record
        if (updrecord.length > 1) {
            db.query(sqlquery, updrecord, (err, result) => {
                if (err) {
                    res.redirect("/");
                }
                // display update food page
                res.redirect("/update");
            });
        } else {
            console.log("Food has been updated");
            res.redirect("/update");
        }
    });
    app.post("/totals", function(req, res) {
        // query database to get all the foods
        //console.log(req.body);
        let sqlquery = "SELECT * FROM foods";

        // execute sql query
        db.query(sqlquery, (err, result) => {
        if (err) {
            res.redirect("/");
        }

        // define an array to contain the food objects and the totals
        let totalResults = [];

        // define and initialise variable for variables component totals
        let tcalories = 0.0;
        let tcarbs = 0.0;
        let tfats = 0.0;
        let tprotein = 0.0;
        let tsalt = 0.0;
        let tsugar = 0.0;

        // loop through every food, apply factor and calculate component totals
        // only if the factor > 0.0 then store the record including the mutiplying factor
        var i;
        for (i=0; i<result.length; i++) {
            if (parseFloat(req.body.factor[i])> 0.0) {
                result[i].factor = req.body.factor[i];
                totalResults.push(result[i]);
                tcalories += (parseFloat(result[i].calories)*parseFloat(req.body.factor[i]));
                tcarbs    += (parseFloat(result[i].gcarbs)*parseFloat(req.body.factor[i]));
                tfats     += (parseFloat(result[i].gfat)*parseFloat(req.body.factor[i]));
                tprotein  += (parseFloat(result[i].gprotein)*parseFloat(req.body.factor[i]));
                tsalt     += (parseFloat(result[i].gsalt)*parseFloat(req.body.factor[i]));
                tsugar    += (parseFloat(result[i].gsugar)*parseFloat(req.body.factor[i]));
            }
        }
        
        // define an object to hold all the totals and set values for each component
        let totals = new Object;
        totals.fname = 'TOTALS';
        totals.calories = tcalories.toFixed(1);
        totals.gcarbs   = tcarbs.toFixed(1);
        totals.gprotein = tprotein.toFixed(1);
        totals.gfat     = tfats.toFixed(1);
        totals.gsalt    = tsalt.toFixed(1);
        totals.gsugar   = tsugar.toFixed(1);
        totals.factor   = 1.0;

        // store the totals in the totalResults array to display on the page
        totalResults.push(totals);

        // render the totals page with these values
        res.render("totals.ejs", {totals:totalResults});
        });
    });
}