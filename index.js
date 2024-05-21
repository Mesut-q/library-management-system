// main

const express= require("express");
const mysql = require("mysql");
const session = require('express-session');

const app = express();

const router = express.Router();


// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if you are using HTTPS
}));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "deneme",
    database: "bmps"
});



db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the MySQL database.");
});







router.get("/homepage/authors", function(req, res) {
    db.query('SELECT * FROM author', (error, results) => {
        if (error) {
            console.error("Database error:", error);
            throw error;
        }
        const authors = results; // Assign the book list to a variable
    res.render('authors', { authors: authors });
});
});




router.get("/homepage/genres", function(req, res) {

    db.query('SELECT * FROM genre', (error, results) => {
        if (error) {
            console.error("Database error:", error);
            throw error;
        }
        const genres = results; // Assign the book list to a variable
    res.render('genres', {genres : genres });
});

});

router.post("/add-reservation", function(req, res){
    const {isbn, reservation_date} = req.body;
    const query = "INSERT INTO book_reservation(Mem_id, ISBN, Res_date, Res_status) VALUES (?,?,?,?)";
    const values = [session.memid, isbn, reservation_date, "Reserved"];
    db.query(query, values, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            throw error;
        }
    res.redirect("/homepage/bookList");
});

})

router.post("/homepage/bookList", function(req, res){
    const {isbn, reservation_date} = req.body;
    const query = "UPDATE book_reservation SET Res_status=?, Mem_id=?, Res_date=? WHERE ISBN=?";
    const values = ["Reserved", session.memid, reservation_date, isbn];
    db.query(query, values, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            throw error;
        }
    res.redirect("/homepage/bookList");
});
 })

 

 router.get("/homepage/bookList", function(req, res) {
    const q = "SELECT ISBN,Title,Publication_date,AuthorName,GenreName,ReservationStatus FROM BookDetails;"
    db.query(q, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            throw error;
        }
        const reserverdQuery = "SELECT ISBN FROM book_reservation";
        db.query(reserverdQuery, (error, reserved) => {
            if (error) {
                console.error("Database error:", error);
                throw error;
            }
            arr = []
            for(i=0; i<reserved.length;i++){
                arr[i] = reserved[i].ISBN;
            }
            const bookList = results; // Assign the book list to a variable
            res.render('bookList', { bookList: bookList , reserved_books_list:arr});
        });
    });
     
     
 });






 router.get("/homepage", function(req, res, next){
         res.render("homepage"); 
    
 });
 // Global access control middleware
app.use((req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login'); // Redirect to the login page if the user is not logged in
    } else {
        next(); // Continue processing the request if the user is logged in
    }
});
    
 router.get("/login", function(req, res, next){
   if(req.session.userId=="giriş" && req.session.loggedin=="admin"){




    const all = "SELECT * FROM author";
    db.query(all, (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          res.status(500).send('An error occurred while registering the user.');
          return;
        }
        const genreQ ="SELECT * FROM genre";
        db.query(genreQ, (err, genres) => {
            if (err) {
              console.error('Error inserting user:', err);
              res.status(500).send('An error occurred while registering the user.');
              return;
            }
            const getReservations = "SELECT * FROM reservedbooksdetails" // view
            db.query(getReservations, (err, reservations) => {
                if (err) {
                  console.error('Error inserting user:', err);
                  res.status(500).send('An error occurred while registering the user.');
                  return;
                }

                const getBorrowedBooks = "SELECT * FROM book_reservation WHERE Res_status='Borrowed';";
                db.query(getBorrowedBooks, (err, borrowed) => {
                    if (err) {
                        console.error('Error inserting book:', err);
                        res.status(500).send('An error occurred while adding the book.');
                        return;
                    }
                res.render("admin_page", {authors:result, genres:genres, reservations:reservations, borrowed:borrowed});
                    
                })
              });
          });
      });


   }
   
    else if (req.session.userId) {
        res.redirect('/homepage'); // Redirect to the home page if the user is already logged in
    } 
    
    
    else {
        res.render("login"); // Show login page if not logged in
    }
 })

 router.get("", function(req, res, next){
     res.render("anasayfa");
 })




//login
router.post('/login', (req, res) => {
    const { memname, memid } = req.body;
    // Create a MySQL query
    const sql = `SELECT Mem_id, Mem_name FROM members WHERE Mem_name = ? AND Mem_id = ?`;
    const values = [memname, memid];

    // Search user in database
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('An error occurred while processing the request.');
            return;
        }

        if (result.length > 0) {
            // Redirect to another page on successful login
            req.session.userId="giriş";
            if(memname=="admin"){
                req.session.loggedin="admin";
                const all = "SELECT * FROM author";
                db.query(all, (err, result) => {
                    if (err) {
                      console.error('Error inserting user:', err);
                      res.status(500).send('An error occurred while registering the user.');
                      return;
                    }
                    const genreQ ="SELECT * FROM genre";
                    db.query(genreQ, (err, genres) => {
                        if (err) {
                          console.error('Error inserting user:', err);
                          res.status(500).send('An error occurred while registering the user.');
                          return;
                        }
                        const getReservations = "SELECT * FROM reservedbooksdetails"
                        db.query(getReservations, (err, reservations) => {
                            if (err) {
                              console.error('Error inserting user:', err);
                              res.status(500).send('An error occurred while registering the user.');
                              return;
                            }

                            const getBorrowedBooks = "SELECT * FROM book_reservation WHERE Res_status='Borrowed';";
                            db.query(getBorrowedBooks, (err, borrowed) => {
                                if (err) {
                                    console.error('Error inserting book:', err);
                                    res.status(500).send('An error occurred while adding the book.');
                                    return;
                                }
                            res.render("admin_page", {authors:result, genres:genres, reservations:reservations, borrowed:borrowed});
                                
                            })
                          });
                      });
                  });
            }
            
            
            
            
            
            else{
                res.render('homepage');
                session.memname = memname;
                session.memid = memid;
                req.session.userId = result[0].Mem_id;  // Here 'id' is the unique identifier of the user in the database.
            }
          
        } else {
            // User not found, show error message
            res.render('login', { error: 'Invalid username or password.' });
        }
    });
});


//register

 // Registration page route
 router.get('/register', (req, res) => {
    res.render('register');
  });
  
  // New user registration route
  router.post('/register', (req, res) => {
    const { memid, mem_name, email, phonenum, address, country} = req.body;
  
    // Create a MySQL query
    const sql = `INSERT INTO members (Mem_id, Mem_name, Email, PhoneNum, Address, country) VALUES (?, ?, ?, ?,?,?)`;
    const values = [memid, mem_name, email, phonenum, address, country];
  
    // Add the user to the database
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        res.status(500).send('An error occurred while registering the user.');
        return;
      }

      console.log('User registered successfully:', result);
      res.status(200).send('User registered successfully.');
    });
  });

// Book addition route
router.post("/add-book", function(req, res) {
    const { isbn, title, publicationDate, authorId, genre } = req.body;

    // SQL insert query
    const sql = `INSERT INTO book (ISBN, Title, Publication_date, Author_id, Genre_id) VALUES (?, ?, ?, ?, ?)`;

    // Parameters
    const values = [isbn, title, publicationDate, authorId, genre];

    // Add to database
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting book:', err);
            res.status(500).send('An error occurred while adding the book.');
            return;
        }
        console.log('Book added successfully:', result);
        res.send('Book added successfully.');
    });
});

router.post("/add-author", function(req, res){
    const {name} = req.body;
    const sql = "INSERT INTO author(Aname) VALUES (?)"
    const values = [name];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting book:', err);
            res.status(500).send('An error occurred while adding the book.');
            return;
        }
        console.log('Author added successfully:', result);
        res.redirect("/login");
    })
})

router.post("/add-genre", function(req, res){
    const {genre} = req.body;
    const insertGenre = "INSERT INTO genre(Gname) VALUES (?)";
    const values = [genre];
    db.query(insertGenre, values, (err, result) => {
        if (err) {
            console.error('Error inserting book:', err);
            res.status(500).send('An error occurred while adding the book.');
            return;
        }
        console.log('Genre added successfully:', result);
        res.redirect("/login");
    })
})

router.post("/borrow", function(req, res){
    const {isbn, memid, borroweddate, returndate} = req.body;
    insertQuery = "INSERT INTO borrowed_book(Mem_id, ISBN, Borrow_date, Return_date, Status) VALUES (?,?,?,?,?);"
    const values = [memid, isbn, borroweddate, returndate, "Borrowed"];
    
    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting book:', err);
            res.status(500).send('An error occurred while adding the book.');
            return;
        }
        const updateQuery = "UPDATE book_reservation SET Res_status='Borrowed' WHERE ISBN=?";
        const v = [isbn];
        db.query(updateQuery, v, (err, result) => {
            if (err) {
                console.error('Error inserting book:', err);
                res.status(500).send('An error occurred while adding the book.');
                return;
            }
            res.redirect("/login");




        })
    })
})

router.post("/teslimalindi", function(req, res){
    const {availableyap} = req.body;
    const q1 = "UPDATE book_reservation SET Res_status='Available' WHERE ISBN=?";
    const values = [availableyap];
    db.query(q1, values, (err, result) => {
        if (err) {
            console.error('Error inserting book:', err);
            res.status(500).send('An error occurred while adding the book.');
            return;
        }

        const q2 = "DELETE FROM borrowed_book WHERE ISBN=?";
        db.query(q2, values, (err, result) => {
            if (err) {
                console.error('Error inserting book:', err);
                res.status(500).send('An error occurred while adding the book.');
                return;
            }
            res.redirect("/login");
        })
    })
})

router.post("/logout", function(req,res){
    req.session.userId=undefined;
    res.redirect("/login");
})

module.exports = router