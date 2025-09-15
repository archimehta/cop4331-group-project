<?php
	$inData = getRequestInfo();
	
	$FirstName = $inData["firstName"];
	$LastName = $inData["lastName"];
	$Phone = $inData["phone"];
	$Email = $inData["email"];
	$ProfilePic = $inData["profilePic"];
	$databaseId = $inData["databaseId"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ?, ProfilePic = ? WHERE ID = ?");
		$stmt->bind_param("sssssi",$inData["firstName"], $inData["lastName"], $inData["phone"], $inData["email"], $inData["profilePic"], $databaseId);
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