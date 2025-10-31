// Defines a custom error class for Firestore permission errors.
// This allows us to capture rich contextual information about the
// request that was denied by Firestore Security Rules.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  public requestTime: Date;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify({
        auth: 'Please check the Next.js terminal for the decoded ID token.',
        method: context.operation,
        path: `/databases/(default)/documents/${context.path}`,
        request: {
          resource: {
            data: context.requestResourceData,
          },
        },
      }, null, 2)}`;
      
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.requestTime = new Date();

    // This is to make the error object serializable for the Next.js overlay
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
