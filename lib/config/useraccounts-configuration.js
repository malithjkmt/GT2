

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    lowercaseUsername: false,
    focusFirstInput: true,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: false,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: false,

    // Client-side Validation
    continuousValidation: true,
    negativeFeedback: false,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,



    // Texts
    texts: {
        button: {
            signUp: "Register",
            signIn: "Sign In"
        },
        title:{
            signUp:"Sign Up"
        }

    },
});

AccountsTemplates.removeField('email');
var pwd = AccountsTemplates.removeField('password');

AccountsTemplates.addFields([{
    _id: 'name',
    type: 'text',
    displayName: 'Name',
    required: true,
},{
    _id: 'username',
    type: 'text',
    displayName: 'NIC',
    required: true,
    minLength: 9,
    maxLength: 10,

    //add an validation expression
    errStr: 'Enter a valid NIC number',
    trim: true,
    lowercase: true,
},
{
    _id: 'mobile',
    type: 'tel',
    displayName: 'Mobile Phone',
    required: true,
    minLength: 10,
    maxLength: 10,
    re:/^[0-9]+$/,
    errStr: 'should be like: e.g: 0777203574',
}


]);
AccountsTemplates.addField(pwd);