/**
 * Replaces the inner html of html elements with a specified cookie value.
 *
 * Could this have been done using server-side rendering? Yes, and it would probably have been even better.
 * However, this way I don't need to bother with a render engine and I can just serve static files instead.
 *
 * @example
 * // document.cookie = "error=This is an error message; someOtherCookie=1"
 * <p cookie-replace="error"></p>
 *
 * // Result
 * <p>This is an error message</p>
 * @author Noah Visser
 */

// Prevent variables from being put in the global scope.
{
	const cookies = document.cookie
		.split('; ')
		.map(o => o.split('='))
		.reduce((accumulator, currentValue) => {
				return {...accumulator, [currentValue[0]]: currentValue[1]};
			}, {}
		);

	// Iterate over all the HTML elements that have the 'cookie-replace' attribute.
	for (let element of document.querySelectorAll('[cookie-replace]')) {
		let cookieName = element.attributes.getNamedItem('cookie-replace').value;
		element.attributes.removeNamedItem('cookie-replace');
		// Check if the required cookie entry exists.
		if (!Object.hasOwn(cookies, cookieName)) {
			console.error(`Couldn't find cookie with name '${cookieName}'.`);
			continue;
		}
		element.innerHTML = cookies[cookieName];
	}
}
