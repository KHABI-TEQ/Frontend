# Verification Report Submission Payload Documentation

## Updated Endpoint
**POST** `/api/verifyAccessCode/submitReport/{documentID}`

---

## New Payload Structure (With Additional Documents)

When the third-party verification officer submits a report with optional additional supporting documents, the payload will now include:

### Payload Schema

```typescript
{
  report: {
    originalDocumentType: string;
    newDocumentUrl?: string;           // Optional verified document URL
    description: string;
    status: 'registered' | 'unregistered';
  };
  additionalDocuments?: [               // Only included if documents are added
    {
      name: string;                     // Document name/title
      documentFile: string;             // Document URL (uploaded)
      comment: string;                  // Comments about the document
    }
  ]
}
```

---

## Example 1: Submission WITHOUT Additional Documents

```json
{
  "report": {
    "originalDocumentType": "survey-plan",
    "newDocumentUrl": "https://cloudinary.com/upload/v1234567890/verified-doc.pdf",
    "description": "Document verified against official records. All details match and are authentic.",
    "status": "registered"
  }
}
```

---

## Example 2: Submission WITH Additional Documents

```json
{
  "report": {
    "originalDocumentType": "survey-plan",
    "newDocumentUrl": "https://cloudinary.com/upload/v1234567890/verified-doc.pdf",
    "description": "Document verified against official records. All details match and are authentic.",
    "status": "registered"
  },
  "additionalDocuments": [
    {
      "name": "Police Report",
      "documentFile": "https://cloudinary.com/upload/v1234567890/police-report.pdf",
      "comment": "Background verification completed. No issues found."
    },
    {
      "name": "Land Inspection Report",
      "documentFile": "https://cloudinary.com/upload/v1234567890/inspection-report.jpg",
      "comment": "Physical inspection conducted on 2026-01-15. Property condition verified."
    },
    {
      "name": "Title Deed Scan",
      "documentFile": "https://cloudinary.com/upload/v1234567890/title-deed.png",
      "comment": "Scanned copy of original title deed. All signatures verified."
    }
  ]
}
```

---

## Example 3: Submission with Document Rejection & Additional Evidence

```json
{
  "report": {
    "originalDocumentType": "Certificate of Occupancy",
    "description": "Document does not match official records. The registration number in the document does not correspond to the property location. Additional evidence required.",
    "status": "unregistered"
  },
  "additionalDocuments": [
    {
      "name": "Government Registry Lookup",
      "documentFile": "https://cloudinary.com/upload/v1234567890/registry-lookup.pdf",
      "comment": "Official government registry shows different registration details for this location."
    },
    {
      "name": "Discrepancy Report",
      "documentFile": "https://cloudinary.com/upload/v1234567890/discrepancy-report.pdf",
      "comment": "Detailed comparison between submitted document and official records."
    }
  ]
}
```

---

## Field Descriptions

### report object
- **originalDocumentType** (string, required): The type of document being verified (e.g., "survey-plan", "Certificate of Occupancy", "Deed of Assignment")
- **newDocumentUrl** (string, optional): URL of the verified/scanned document uploaded by the officer
- **description** (string, required): Verification findings and notes
- **status** (string, required): Verification outcome - either "registered" (verified) or "unregistered" (rejected)

### additionalDocuments array (optional)
Only included when the officer adds supporting documents. Each document contains:

- **name** (string, required): Name/title of the additional document
- **documentFile** (string, required): Cloudinary URL of the uploaded document
- **comment** (string, required/optional): Notes or context about the document

---

## Validation Rules (Frontend)

The frontend will validate:
1. ✅ `report.description` is not empty
2. ✅ If `additionalDocuments` array exists:
   - Each document must have a `name` (non-empty)
   - Each document must have a `documentFile` URL (uploaded)
   - `comment` can be empty but is recommended

---

## Backend Implementation Notes

### What Changed
1. **New optional field**: `additionalDocuments` array in payload
2. **Conditional inclusion**: Field only appears when documents are added (checked via `dynamicDocuments.length > 0`)
3. **No breaking changes**: Old submissions without additional documents will still work (backward compatible)

### Migration Steps
1. Update your API endpoint to accept the optional `additionalDocuments` field
2. Store additional documents in your database with relationship to the verification report
3. Handle the new field gracefully (check if it exists before processing)
4. Update your database schema to accommodate multiple supporting documents

### Suggested Database Structure

```javascript
// Verification Report Document
{
  _id: ObjectId,
  documentId: string,
  report: {
    originalDocumentType: string,
    newDocumentUrl: string,
    description: string,
    status: string
  },
  additionalDocuments: [
    {
      name: string,
      documentFile: string,
      comment: string,
      uploadedAt: Date        // Optional: timestamp
    }
  ],
  submittedAt: Date,
  submittedBy: string        // Officer ID
}
```

---

## Console Output

The frontend will log the complete payload to the browser console before submission:

```
Submission Payload: {
  "report": { ... },
  "additionalDocuments": [ ... ]
}
```

You can monitor the network tab in DevTools to see the actual request being sent to your API.

---

## Testing the Payload

### cURL Example (Testing with Additional Documents)
```bash
curl -X POST https://your-api.com/api/verifyAccessCode/submitReport/696756605ea5ee45855442e5 \
  -H "Content-Type: application/json" \
  -d '{
    "report": {
      "originalDocumentType": "survey-plan",
      "newDocumentUrl": "https://example.com/doc.pdf",
      "description": "Verified successfully",
      "status": "registered"
    },
    "additionalDocuments": [
      {
        "name": "Supporting Evidence",
        "documentFile": "https://example.com/evidence.pdf",
        "comment": "Additional verification document"
      }
    ]
  }'
```

---

## Backward Compatibility

✅ **Fully backward compatible** - your API will receive submissions in two formats:

**Old Format** (no additional documents):
```json
{
  "report": { ... }
}
```

**New Format** (with additional documents):
```json
{
  "report": { ... },
  "additionalDocuments": [ ... ]
}
```

Simply check if `additionalDocuments` exists in your payload handling logic:
```javascript
if (payload.additionalDocuments && payload.additionalDocuments.length > 0) {
  // Handle additional documents
}
```

---

## Summary

The submission now includes an optional `additionalDocuments` array that contains supporting documents with the following structure:
- **name**: Document identifier/title
- **documentFile**: Cloudinary URL of uploaded file
- **comment**: Notes about the document

This allows verification officers to attach multiple supporting documents alongside their verification report without breaking existing functionality.
