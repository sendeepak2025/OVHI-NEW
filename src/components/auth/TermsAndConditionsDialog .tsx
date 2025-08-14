import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import { providerTermsUpload } from "@/services/operations/auth"
import { useSearchParams } from "react-router-dom";
import { PracticeInformationDialog } from "./PracticeInformationDialog";
// To improve HTML rendering, especially for complex layouts, consider adding html2canvas:
// import html2canvas from 'html2canvas';

export const TermsAndConditionsDialog = ({ isOpen, onAccept, onCancel }) => {
  const [signature, setSignature] = useState(null);
  const [signaturePad, setSignaturePad] = useState(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSent, setIsSent] = useState(false);

  // Varn Digihealth Provider Terms & Conditions
  const termsAndConditionsContent = `
    <h2>1. Parties, Acceptance & Definitions</h2>
    <p><b>Parties.</b> This Agreement is between Varn LLC, a Delaware limited liability company doing business as Varn Digihealth, with its principal business address at 16192 Coastal Hwy, Lewes, DE 19958 (“Varn Digihealth,” “we,” “us,” or “our”), and the healthcare provider or practice accepting these terms (“Provider,” “you,” or “your”).</p>
    <p><b>Acceptance.</b> By clicking “I Agree,” creating an account, or accessing or using the Varn Digihealth electronic health record (EHR) system and related services (collectively, the “Services”), Provider confirms that they have read, understood and agreed to be bound by this Agreement and that they have authority to do so on behalf of themselves and any organization they represent. If Provider does not agree to these terms, Provider must not access or use the Services.</p>
    <p><b>Authorized User.</b> A natural person designated by Provider under Provider’s supervision who is given access credentials to use the Services (e.g., physicians, nurse practitioners, physician assistants, or administrative staff). Provider is solely responsible for designating Authorized Users and managing their access levels.</p>
    <p><b>Protected Health Information (PHI).</b> Individually identifiable health information as defined by the Health Insurance Portability and Accountability Act of 1996 (HIPAA) and its regulations.</p>

    <h2>2. Grant of Rights & Restrictions</h2>
    <p><b>License.</b> Varn Digihealth grants Provider a limited, revocable, non‑exclusive, non‑transferable, non‑sublicensable license to access and use the Services solely for Provider’s legitimate clinical, billing and administrative purposes during the term of this Agreement. Provider gains no ownership interest in the software or services.</p>
    <p><b>Restrictions.</b> Provider shall not:</p>
    <ul>
      <li>Sell, rent, sublicense, assign, distribute or otherwise transfer any part of the Services or information derived from them.</li>
      <li>Reverse engineer, decompile, disassemble, translate, or attempt to discover the source code or algorithms, or use any part of the Services to build a competing product or service.</li>
      <li>Circumvent or disable any security or authentication mechanism, or use bots, scrapers or other automated tools to access the Services.</li>
      <li>Provide or permit access to the Services by anyone other than Authorized Users.</li>
    </ul>

    <h2>3. Provider Responsibilities</h2>
    <p><b>Data Accuracy & Backup.</b> Provider is responsible for entering and maintaining accurate, complete and current data in the Services and for backing up and preserving its records.</p>
    <p><b>Authorized Users.</b></p>
    <ul>
      <li>Provider must designate and manage Authorized Users and ensure each has appropriate access levels. Provider warrants that each Authorized User is legally permitted to access PHI and will comply with applicable laws and this Agreement.</li>
      <li>Each Authorized User must use unique credentials and may not share or reassign them.</li>
      <li>Provider is liable for all acts and omissions of Authorized Users and must promptly revoke access when an Authorized User leaves Provider’s workforce or no longer requires access.</li>
    </ul>
    <p><b>Security & HIPAA Compliance.</b> Provider will implement administrative, physical and technical safeguards to protect information accessed through the Services, consistent with federal, state and local requirements, including HIPAA’s Privacy and Security Rules. Provider will:</p>
    <ul>
      <li>Maintain security over all credentials and devices used to access the Services.</li>
      <li>Immediately notify Varn Digihealth of any suspected or actual security incident or unauthorized access and cooperate in investigating and mitigating such incidents.</li>
      <li>Ensure compliance with all laws governing privacy, data security, telehealth, and communications.</li>
    </ul>
    <p><b>Regulatory & Professional Compliance.</b> Provider is solely responsible for ensuring its use of the Services (including communications with patients or other providers) complies with all applicable laws and professional standards.</p>
    <p>Varn Digihealth does not warrant that use of the Services will ensure compliance.</p>

    <h2>4. Confidentiality & Data Use</h2>
    <p><b>Confidential Information.</b> Each party may receive non‑public business, technical or financial information of the other party (“Confidential Information”). Each party will protect the other’s Confidential Information with at least reasonable care and use it only for purposes of performing this Agreement</p>
    <p>Confidential Information does not include information that is publicly available or independently developed without reference to the other party’s information.</p>
    <p><b>Protected Health Information.</b></p>
    <ul>
      <li>Varn Digihealth will not use or disclose Provider’s PHI except as permitted by this Agreement or required by law and will implement safeguards required by HIPAA.</li>
      <li>Varn Digihealth will promptly report unauthorized uses or disclosures of PHI and will require subcontractors handling PHI to agree to similar restrictions.</li>
      <li>Upon termination, Varn Digihealth will make Provider’s PHI available and will return or securely destroy PHI where feasible, continuing to protect any retained PHI if destruction is infeasible.</li>
    </ul>
    <p><b>De‑Identified & Aggregate Data.</b> Varn Digihealth may create de‑identified or aggregate data from Provider’s information for analytics, research and improvement of the Services, provided that such data does not identify Provider or any individual patient.</p>

    <h2>5. Prohibited Conduct</h2>
    <p>Provider and its Authorized Users agree not to:</p>
    <ul>
      <li>Use the Services for time‑sharing or service bureau purposes or to process data for third parties.</li>
      <li>Attempt to gain unauthorized access to any portion of the Services, other users’ data, or systems connected to the Services.</li>
      <li>Transmit, upload or store any viruses or malicious code on the Services.</li>
      <li>Use the Services in a manner that infringes intellectual property or privacy rights, or violates any applicable law.</li>
    </ul>

    <h2>6. Disclaimers & Professional Responsibility</h2>
    <p><b>No Medical Advice.</b> The Services are tools to support Provider’s practice. Varn Digihealth does not provide medical, legal or professional advice or recommendations, and is not responsible for the completeness, accuracy or utility of any information in the Services</p>
    <p>Provider is solely responsible for clinical and professional decisions.</p>
    <p><b>Warranty Disclaimer.</b> The Services, documentation and any data are provided “as‑is” and “as‑available,” with all faults. Varn Digihealth disclaims all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose and non‑infringement</p>
    <p>Varn Digihealth does not guarantee that the Services will be uninterrupted, error‑free or secure.</p>
    <p><b>Limitation of Liability.</b> To the fullest extent permitted by law, Varn Digihealth shall not be liable for indirect, incidental, special, consequential or punitive damages arising out of or relating to this Agreement or the Services, even if advised of the possibility of such damages. Varn Digihealth’s total liability for any direct damages shall not exceed the fees paid by Provider to Varn Digihealth in the twelve (12) months preceding the claim. Varn Digihealth is not responsible for acts or omissions of third parties or for internet service interruptions.</p>

    <h2>7. AI & Machine‑Learning Features</h2>
    <p><b>AI Functionality.</b> Certain features of the Services may employ artificial intelligence (“AI”) or machine‑learning algorithms to analyze data and provide insights, predictive analytics, suggestions or decision‑support. These AI features are optional and intended solely to assist Provider in clinical or administrative workflows.</p>
    <p><b>Informational Use Only.</b> Outputs generated by AI features are provided for informational purposes and do not constitute medical advice. Provider acknowledges that AI‑generated suggestions may be incomplete or inaccurate, and Varn Digihealth does not warrant the accuracy or reliability of such outputs.</p>
    <p><b>Provider Responsibility.</b> Provider remains solely responsible for verifying the accuracy of AI outputs and for all clinical, diagnostic and treatment decisions. Provider agrees not to rely solely on AI features and to exercise professional judgment in all patient care and administrative decisions. This reinforces the Service’s existing disclaimer that Varn Digihealth does not provide professional or medical advice.</p>
    <p><b>Limitation of Liability.</b> Varn Digihealth disclaims any liability arising from Provider’s use or reliance on AI‑generated outputs. The general warranty disclaimer and limitation of liability provisions in these Terms apply equally to AI features.</p>

    <h2>8. Indemnification</h2>
    <p>Provider agrees to indemnify, defend and hold harmless Varn Digihealth and its affiliates, officers, directors, employees and agents from any claims, damages, losses and expenses (including reasonable attorneys’ fees) arising out of or related to (a) Provider’s or its Authorized Users’ use or misuse of the Services, (b) any breach of this Agreement, (c) any violation of applicable law, or (d) any negligence or misconduct by Provider or its Authorized Users.</p>

    <h2>9. Term & Termination</h2>
    <p><b>Term.</b> This Agreement begins upon Provider’s acceptance and continues until terminated by either party as set forth herein.</p>
    <p><b>Termination by Provider.</b> Provider may terminate this Agreement by giving written notice to Varn Digihealth and ceasing all use of the Services.</p>
    <p><b>Termination by Varn Digihealth.</b> Varn Digihealth may suspend or terminate Provider’s access to the Services immediately if Provider breaches a material term of this Agreement (including security obligations or prohibited conduct) and fails to cure the breach within thirty (30) days of receiving notice, or immediately if cure is not possible.</p>
    <p><b>Effect of Termination.</b> Upon termination, Provider and its Authorized Users must cease all access to and use of the Services and return or delete all Confidential Information belonging to Varn Digihealth. Sections dealing with confidentiality, data use, indemnification, AI functionality, and limitations of liability survive termination.</p>

    <h2>10. Governing Law & Miscellaneous</h2>
    <p><b>Governing Law.</b> This Agreement is governed by the laws of the State of Delaware (or another state specified in a separate written agreement), without regard to its conflicts of law rules.</p>
    <p><b>Notices.</b> Notices required under this Agreement must be in writing and sent to Varn Digihealth at 16192 Coastal Hwy, Lewes, DE 19958, and to Provider at the address provided during registration, or to such other addresses as either party may designate in writing.</p>
    <p><b>Assignment.</b> Provider may not assign or transfer this Agreement or its rights or obligations without Varn Digihealth’s prior written consent. Varn Digihealth may assign this Agreement to a successor, affiliate or in connection with a merger or sale of substantially all its assets.</p>
    <p><b>Amendments.</b> Varn Digihealth may modify these Terms by posting an updated version and providing reasonable notice. Provider’s continued use of the Services after notice constitutes acceptance of the updated terms.</p>
    <p><b>Entire Agreement.</b> This Agreement constitutes the entire agreement between the parties regarding the Services and supersedes any prior or contemporaneous agreements. If any provision is held unenforceable, the remainder of the Agreement shall continue in full force.</p>
  `;


  const handleClearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
      setSignature(null);
    }
  };

  const convertImageToPdf = (imageData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 15; // Increased margin for better readability
    let yOffset = margin;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const textMaxWidth = pageWidth - 2 * margin;

    // Add document title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold'); // Specify font family and style
    pdf.text("Varn Digihealth Provider Terms & Conditions", pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 20;

    // Parse and add Terms and Conditions content
    pdf.setFont('helvetica', 'normal');
    const termsHtml = new DOMParser().parseFromString(termsAndConditionsContent, 'text/html');
    const sections = termsHtml.body.children;

    for (let i = 0; i < sections.length; i++) {
      const element = sections[i];
      const text = element.textContent.trim();

      // Estimate height for new content
      let estimatedHeight = 0;
      if (element.tagName === 'H2') {
        estimatedHeight = 10; // For heading
      } else if (element.tagName === 'P') {
        const splitText = pdf.splitTextToSize(text, textMaxWidth);
        estimatedHeight = (splitText.length * 5) + 5; // For paragraphs
      } else if (element.tagName === 'UL') {
        const listItems = element.querySelectorAll('li');
        listItems.forEach(item => {
          const itemText = "• " + item.textContent.trim();
          const splitItemText = pdf.splitTextToSize(itemText, textMaxWidth - 10); // Indent for bullet
          estimatedHeight += (splitItemText.length * 5) + 5; // For list items
        });
      }

      // Add a new page if content overflows
      if (yOffset + estimatedHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yOffset = margin;
      }

      // Add content based on tag type
      if (element.tagName === 'H2') {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text, margin, yOffset);
        yOffset += 8; // Adjust line height for headings
      } else if (element.tagName === 'P') {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const boldTextMatches = text.match(/<b>(.*?)<\/b>/g); // Find bold tags

        // Basic handling for bold text within paragraphs. For complex cases, use html2canvas.
        if (boldTextMatches) {
          let currentText = text;
          let currentX = margin;
          pdf.text(currentText, currentX, yOffset, { maxWidth: textMaxWidth });
          const lines = pdf.splitTextToSize(currentText, textMaxWidth);
          yOffset += lines.length * 5; // Move Y down by calculated lines
        } else {
          const splitText = pdf.splitTextToSize(text, textMaxWidth);
          pdf.text(splitText, margin, yOffset);
          yOffset += (splitText.length * 5); // Adjust line height for paragraphs
        }
        yOffset += 3; // Small extra space between paragraphs

      } else if (element.tagName === 'UL') {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const listItems = element.querySelectorAll('li');
        listItems.forEach(item => {
          const itemText = "• " + item.textContent.trim();
          const splitItemText = pdf.splitTextToSize(itemText, textMaxWidth - 5); // Indent for bullet
          pdf.text(splitItemText, margin + 5, yOffset); // Add margin for bullet point
          yOffset += (splitItemText.length * 5);
        });
        yOffset += 3; // Small extra space after list
      }
    }

    // Add signature section title
    yOffset += 20; // Space before signature section
    if (yOffset + 60 > pdf.internal.pageSize.getHeight() - margin) { // Check space for signature and label
      pdf.addPage();
      yOffset = margin;
    }
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Provider E-Signature:", margin, yOffset);
    yOffset += 10;

    // Add Signature image
    if (signature) {
      const imgWidth = 80; // Smaller width for signature
      const imgHeight = 40; // Smaller height for signature
      const xSignature = margin; // Place signature at the left margin

      if (yOffset + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yOffset = margin;
      }

      pdf.addImage(signature, 'PNG', xSignature, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text("_________________________", xSignature, yOffset); // Underline
      yOffset += 5;
      pdf.text("Signature of Provider", xSignature + imgWidth / 2, yOffset, { align: "center" });
    }

    // Add Date
    yOffset += 15; // Space after signature
    if (yOffset + 10 > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yOffset = margin;
    }
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yOffset);

    // Add a final disclaimer at the bottom
    yOffset = pdf.internal.pageSize.getHeight() - margin - 10; // Position near bottom
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text("This document constitutes the digitally signed Varn Digihealth Provider Terms & Conditions.", margin, yOffset);


    return pdf;
  };

  const handleDownloadPdf = (pdf) => {
    try {
      pdf.save("Varn_Digihealth_Provider_Terms_and_Conditions_Signed.pdf");
      toast({
        title: "Download Initiated",
        description: "Your signed terms and conditions PDF should be downloading now.",
      });
    } catch (error) {
      console.error("Error during PDF download:", error);
      toast({
        title: "Download Failed",
        description: "Could not initiate PDF download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const uploadPdfToAwsS3 = async (pdfBlob) => {
    // This is a placeholder for your backend integration.
    // **NEVER directly upload to S3 from client-side with AWS credentials.**
    // You should send this Blob to your secure backend, and your backend
    // will handle the actual upload to AWS S3.
    console.log("Simulating upload to AWS S3...");
    console.log("PDF Blob ready for upload (size:", pdfBlob, "bytes):", pdfBlob);

  
    const formData = new FormData()
    formData.append("pdf", pdfBlob, "Signed_Terms_And_Conditions.pdf");

    const res = await providerTermsUpload(formData, token);

    if (res) {

      setIsSent(true)
      return true
    }
    return false
  };


   const generatePdfWithTermsAndSignature = (signatureData) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10;
      let yOffset = margin;
  
      // Add Terms and Conditions
      pdf.setFontSize(12);
      // Use html2canvas and then addImage for better HTML rendering, or
      // for simple text, you can parse and add line by line.
      // For this example, we'll parse basic HTML for text.
      
      const termsHtml = new DOMParser().parseFromString(termsAndConditionsContent, 'text/html');
      const paragraphs = termsHtml.body.children;
  
      for (let i = 0; i < paragraphs.length; i++) {
          const element = paragraphs[i];
          const text = element.textContent.trim();
  
          if (element.tagName === 'H2') {
              pdf.setFontSize(14);
              pdf.setFont(undefined, 'bold');
              pdf.text(text, margin, yOffset);
              yOffset += 7; // Line height for headings
          } else if (element.tagName === 'P') {
              pdf.setFontSize(10);
              pdf.setFont(undefined, 'normal');
              const splitText = pdf.splitTextToSize(text, pdf.internal.pageSize.getWidth() - 2 * margin);
              pdf.text(splitText, margin, yOffset);
              yOffset += (splitText.length * 5) + 5; // Line height for paragraphs
          }
      }
  
      // Add some space before signature
      yOffset += 20;
  
      // Add Signature
      if (signatureData) {
        const imgWidth = 80; // Smaller width for signature
        const imgHeight = 40; // Smaller height for signature
        const xSignature = pdf.internal.pageSize.getWidth() - margin - imgWidth; // Align to right
        
        // Ensure signature is placed within page bounds
        if (yOffset + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yOffset = margin;
        }
  
        pdf.addImage(signatureData, 'PNG', xSignature, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 5;
        pdf.setFontSize(10);
        pdf.text("E-Signature of Agreement", xSignature + imgWidth / 2, yOffset, { align: "center" });
      }
  
      // Add a text disclaimer below the signature or terms
      yOffset += 15;
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'italic');
      pdf.text("This document includes digitally signed terms and conditions.", margin, yOffset);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yOffset + 5);
  
      return pdf;
    };


  const handleAcceptTerms = async () => {
    if (!signaturePad || signaturePad.isEmpty()) {
      toast({
        title: "Signature Required",
        description: "Please provide your e-signature to accept the terms.",
        variant: "destructive",
      });
      return;
    }

    const signatureData = signaturePad.toDataURL("image/png");

    // Generate the PDF
    const pdf = generatePdfWithTermsAndSignature(signatureData);

    // Initiate download for the user
    
    // Prepare PDF for backend upload
    const pdfBlob = pdf.output('blob');
  const res =  await uploadPdfToAwsS3(pdfBlob);
 
 if(res){

   handleDownloadPdf(pdf);
 }

    // Trigger the parent's onAccept callback
    onAccept({
      agreed: true,
      signature,
    });
  };

  return (


    <>
      {
        isSent ? (<>
           <PracticeInformationDialog isOpen={isSent} onCancel={() => setIsSent(false)}   />
        
        </>) : (<Dialog open={isOpen} onOpenChange={onCancel}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Varn Digihealth Provider Terms & Conditions</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="prose max-h-64 overflow-y-auto p-4 border rounded-md bg-gray-50" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent }}>
                {/* Terms and conditions content rendered here */}
              </div>

              <div className="space-y-4">
                <Label className="font-semibold">Your E-Signature</Label>
                <div className="border rounded-md p-2 bg-white">
                  <div className="space-y-2">
                    <SignatureCanvas
                      penColor='black'
                      canvasProps={{ width: 450, height: 150, className: 'sigCanvas border-dashed border-2 w-full' }}
                      ref={(ref) => { setSignaturePad(ref); }}
                      onEnd={() => setSignature(signaturePad.toDataURL())}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleClearSignature}>Clear</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleAcceptTerms}>
                Agree & Explore
              </Button>
            </div>
          </DialogContent>
        </Dialog>)
      }
    </>

  );
};