from flask import Flask, request, jsonify, send_file
import os
import validators
import re
from uuid import UUID
from pdf_generator import generate_pdf
from lighthouse_runner import run_lighthouse  # function in separate file
from flask_cors import CORS
from goHighLevelManager import highLevelAPI

app = Flask(__name__)
CORS(app)

# Email regex for basic validation
EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")

@app.route('/audit', methods=['POST'])
def audit_website():
    data = request.json

    # Required fields
    required = ['name', 'emailid', 'url', 'phone', 'uuid']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    name = data['name']
    emailid = data['emailid']
    url = data['url']
    phone = data['phone']
    uuid = data['uuid']

    # Validate email
    if not EMAIL_REGEX.match(emailid):
        return jsonify({'error': 'Invalid email address'}), 400

    # Validate URL
    if not validators.url(url):
        return jsonify({'error': 'Invalid URL'}), 400

    # Validate UUID
    try:
        UUID(uuid)  # validate UUID format
    except ValueError:
        return jsonify({'error': 'Invalid UUID'}), 400

    # Prepare output folder
    report_dir = os.path.join('report', uuid)
    os.makedirs(report_dir, exist_ok=True)
    output_path = os.path.join(report_dir, 'report.html')


    try:
        stdout, stderr = run_lighthouse(url, output_path, headless=True)

        pdf_path = os.path.join(report_dir, 'output.pdf')

        generate_pdf(output_path, pdf_path)

        highLevelAPI(data)


        return send_file(pdf_path, as_attachment=True, download_name="lighthouse-report.pdf")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
