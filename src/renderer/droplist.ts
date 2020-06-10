import './elements';
import request from 'request-promise-native';
import { RequestResponse } from 'request';



export default function getProducts():Promise<any> {
	return new Promise((resolve:Function):void => {
		let productApiStatus:HTMLInputElement = <HTMLInputElement>document.getElementById('productApiStatus');
		productApiStatus.value = 'Fetching Products';
		request({
			url: 'http://prosper-products-eu.herokuapp.com/supreme/latest',
			method: 'GET',
			json: true,
			resolveWithFullResponse: true,
			headers: {
				accept: 'application/json'
			}
		})
			.then((response:RequestResponse):void => {
				let body:any = response.body;
				productApiStatus.value = 'Loaded Products';
				resolve(body);
			})
			.catch((error:Error):void => {
				productApiStatus.value = 'Error Fetching Products';
				console.log(error);
				resolve({});
			});
	});
}