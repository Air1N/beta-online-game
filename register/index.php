<?php
if (isset($_POST['register'])) {
  $username = $_POST['username'];
  $password = $_POST['password'];
  
  
}

$servername = "localhost";
$username = "username";
$password = "password";

// Create connection
$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

// Create database
$sql = "CREATE DATABASE myDB";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully";
} else {
    echo "Error creating database: " . $conn->error;
}

$conn->close();
?>
<!doctype html>
<head>
</head>
<body>
  <form method="post">
    <input type="text" name="username" placeholder="Username"><br>
    <input type="text" name="email" placeholder="Email" disabled><br>
    <input type="password" name="password" placeholder="Password"><br>
    <input type="submit" name="register" value="Register">
  </form>
</body>
