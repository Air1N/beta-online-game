<?php
if (isset($_POST['register'])) {
  $username = $_POST['username'];
  $password = $_POST['password'];
  
  
}
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
