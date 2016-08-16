<?php
/**
 * Created by PhpStorm.
 * User: echong
 * Date: 7/28/2015
 * Time: 2:28 PM
 */

header('Content-Type: application/json; charset=utf-8');
$obj = array();

$obj[0] = (array) file_get_contents('http://software.dell.com/jsonrequest/EventListGet/?' . $_SERVER['QUERY_STRING']);
$obj[0] = (array) json_decode($obj[0][0]);

$obj[1] = (array) file_get_contents('http://software.dell.com/jsonrequest/EventWebcastOnDemandListGet/?' . $_SERVER['QUERY_STRING']);
$obj[1] = (array) json_decode($obj[1][0]);

//print_r($obj);

$result = array_merge_recursive($obj[0], $obj[1]);
$count = 0;
$error = '';

foreach($result['count'] as $i) {
    $count += $i;
}

$result['count'] = $count;

foreach($result['error'] as $i) {
    $error .= $i;
}

$result['error'] = $error;

echo json_encode($result);
