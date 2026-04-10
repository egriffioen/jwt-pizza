## ATTACK 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.perfectpizza.click                                                       |
| Classification | Insecure Design                                                           |
| Severity       | ?                                                                             |
| Description    | Intercepted HTTP request and changed price so that it cost -100                 |
| Images         | ![](../images/negativePizzaPrice.png)  |
| Corrections    | Fetch the item/price from the database instead of having the user send it in a request |


## ATTACK 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.perfectpizza.click                                                       |
| Classification | Broken Access Control                                                           |
| Severity       | ?                                                                             |
| Description    | By editing my email to someone else's I can access their account (admin/franchisee/diner). Just submit the new email and refresh the page. |
| Images         | PreEmail Change:![](../images/preEmailChanges.png) PostEmail Change:![](../images/afterSubmittingNewEmail.png) After Refreshing the page: ![](../images/afterRefresh.png) |
| Corrections    | Check to see if an email is already in the database before changing it |


## ATTACK 2.5 (same kind of attack to accomplish a different goal)
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.perfectpizza.click                                                       |
| Classification | Insecure Design                                                           |
| Severity       | ?                                                                             |
| Description    | After doing attack 2 and logging in as the admin, for example, I could change the email back to a regular diner, locking out the admin entirely |
| Images         | Same Idea as Attack 2 (Just do Attack 2 twice) |
| Corrections    | Check to see if an email is already in the database before changing it, and make someone type in their password before making these changes |


## ATTACK 3
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.perfectpizza.click                                                       |
| Classification | Insecure Design                                                           |
| Severity       | ?                                                                             |
| Description    | After doing attack 2, I can change the password without any extra verifcation to lock the user out of their account |
| Images         | Set new email: Change:![](../images/setNewEmail.png) PostEmail Change:![](../images/afterSubmission.png) After Refreshing the page: ![](../images/afterRefresh2.png) Change Passowrd: ![](../images/changePassword.png) Original Password for Laura fails: ![](../images/oldPasswordFails.png) |
| Corrections    | Require the original password in order to change to a new password |


## ATTACK 4
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.perfectpizza.click                                                       |
| Classification | Identification and Authentication Failures                                  |
| Severity       | ?                                                                             |
| Description    | Choose an existing email to log into. Type any password. Intercept the request, change the password to an empty string and forward it. You will gain access to the account. |
| Images         | ![](../images/anyPassword.png) ![](../images/emptyStringPassword.png) ![](../images/BadPasswordSuccess.png) |
| Corrections    | Don't allow empty strings as passwords, make sure the password matches exactly what is in the database for the user |


## ATTACK 5
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 9, 2026                                                                  |
| Target         | pizza.perfectpizza.click                                                       |
| Classification | Security Misconfiguration                                  |
| Severity       | ?                                                                             |
| Description    | All admin accounts have the default a@jwt.com email and admin as the password, allowing me to login as an admin just by knowing the defaults. |
| Images         | ![](../images/defaultAdminSuccess.png) |
| Corrections    | Change the admin password and email after logging in for the first time |