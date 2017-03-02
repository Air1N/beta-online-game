<?php
if (isset($_POST['register'])) {
  $username = $_POST['username'];
  $password = $_POST['password']; 
}

$link = mysqli_connect("127.0.0.1", "my_user", "my_password", "my_db");

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
}

echo "Success: A proper connection to MySQL was made! The my_db database is great." . PHP_EOL;
echo "Host information: " . mysqli_get_host_info($link) . PHP_EOL;

mysqli_close($link);
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
