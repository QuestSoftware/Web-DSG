<?php require 'widget.class.php'; $widget = new Widget(); ?><!DOCTYPE html>
<!--[if IE 8]>
<html class="ie ie8" prefix="og: http://ogp.me/ns#"><![endif]-->
<!--[if IE 9]>
<html class="ie ie9" prefix="og: http://ogp.me/ns#"><![endif]-->
<!--[if !IE]> -->
<html prefix="og: http://ogp.me/ns#"><!-- <![endif]-->
<head lang="en" data-test="<? echo $_GET['page'] ?>">
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title></title>

	<link rel="stylesheet" href="/static/css/bootstrap.css">
	<link rel="stylesheet" href="/static/library/jQueryUI/jquery-ui-1.11.4-structure.css">
	<link rel="stylesheet" href="/static/library/jQueryUI/jquery-ui-1.11.4-theme.css">

	<!--[if IE]>
	<link rel="stylesheet" href="/static/css/bootstrap-ie.css">
	<![endif]-->

	<link rel="stylesheet" href="/static/css/sonicwall.css">

	<?php
	echo $widget->css();
	?>

	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="//oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="//oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
</head>
<body>

<div class="site-wrapper">
	<div class="site-canvas">
		<!-- header starts here -->
		<?php
		echo file_get_contents('templates/header-sonicwall.tpl');
		?>
		<!-- header ends here -->

		<?php
		echo $widget->content();
		?>

		<!-- footer starts here -->
		<?php
		echo file_get_contents('templates/footer-sonicwall.tpl');
		?>
		<!-- footer ends here -->
	</div>
</div>

<script src="/static/library/modernizr.min.js"></script>
<script src="/static/library/jQuery/jquery-1.9.1.min.js"></script>
<script src="/static/library/jQueryUI/jquery-ui-1.11.4.min.js"></script>
<script src="/static/library/jQuery/jquery.cookie.js"></script>
<script src="/static/library/jQuery/jquery.dotdotdot.js"></script>
<script src="/static/library/jQuery/jquery.placeholder.js"></script>
<script src="/static/library/jQuery/jquery.color-2.1.2.min.js"></script>
<script src="/static/library/jQuery/jquery.slidepagination.js"></script>
<script src="/static/library/bootstrap-3.3.4.min.js"></script>
<script src="/static/js/responsive-header-footer.js"></script>
<script src="/static/js/default.js"></script>
<script src="/static/js/sonicwall.js"></script>

<?php
echo $widget->js();
?>

</body>
</html>