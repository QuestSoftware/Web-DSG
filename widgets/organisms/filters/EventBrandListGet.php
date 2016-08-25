<?php
    header('Content-Type: application/json; charset=utf-8');
    //echo file_get_contents('http://software.dell.com/jsonrequest/eventbrandlistget/?' . $_SERVER['QUERY_STRING']);
    $obj = file_get_contents('http://software.dell.com/jsonrequest/eventbrandlistget/?' . $_SERVER['QUERY_STRING']);
    $obj = json_decode($obj);

    //echo print_r($obj, true);

    unset($obj->data[0]);

    //echo print_r($obj, true);
    echo json_encode($obj);
?>