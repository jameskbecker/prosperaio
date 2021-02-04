package captcha

func recaptchaHTML() string {
	return `
<html>
	<head>
		<title>ProsperAIO Captcha</title>
		<script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit" async defer></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
		
		<style>body {background-color: #333333;} label,input{width:300px;}</style>
	</head>
	<body>
		<div id="captcha-container"></div>
		<div>
				<label>Site ID</label>
				<input type="text" id="siteId" name="siteId" value="{{.SiteID}}" required/>
			</div>
		<script>
			function onloadCallback() {
				grecaptcha.render('captcha-container', {
					sitekey: {{.Sitekey}},
					theme: 'dark',
					callback: 'submit',
					size: 'normal'
				})
			}

			function submit() {
				const data = {
					siteId: {{.SiteID}},
					response: grecaptcha.getResponse()
				}
				console.log(data)
				const req = new XMLHttpRequest();
				req.open('POST', "http://{{.SiteID}}:8080/", true);
				req.setRequestHeader('Content-Type', 'application/json');
				req.send(JSON.stringify(data));
				window.close();
			}	
		</script>
	</body>
</html>
	`
}
