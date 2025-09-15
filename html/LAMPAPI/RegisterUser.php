<?php
	$inData = getRequestInfo();
	
	$FirstName = $inData["firstName"];
	$LastName = $inData["lastName"];
	$UserName = $inData["userName"];
	$PlainTextPassword = $inData["password"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		//check if username already exists 
		$check = $conn->prepare("SELECT ID FROM Users WHERE Login = ? LIMIT 1");
		$check->bind_param("s", $UserName);
		$check->execute();
		$result = $check->get_result();
		if ($result->num_rows > 0) 
		{
			http_response_code(409);
			sendResultInfoAsJson(json_encode(["error" => "Username already in use."]));
			$check->close();
			$conn->close();
			exit;
		}
		$check->close();

		$HashedPassword = password_hash($PlainTextPassword, PASSWORD_DEFAULT);

		$stmt = $conn->prepare("INSERT into Users (FirstName,LastName,Login,Password) VALUES(?,?,?,?)");
		$stmt->bind_param("ssss", $FirstName, $LastName, $UserName, $HashedPassword);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	

?>
