// Function to encode form data into a compact format
function encodeFormData(formData) {
  try {
      let bitmask = 0;
      let customMessage = '';
      const labels = ['whatthe', 'idga', 'me', 'yes', 'off', 'and die', 'that', 'it', 'you', 'and the horse you rode in on', 'this', 'the man', 'other'];

      labels.forEach((label, index) => {
          const input = formData.get(label);
          if (input === 'on') {
              bitmask |= (1 << index);
          }
          if (label === 'other') {
              customMessage = formData.get('custom') || '';  // Ensure customMessage is never undefined
          }
      });

      const encodedMessage = btoa(customMessage);  // Base64 encode the custom message
      const encodedData = `${bitmask.toString(36)}-${encodedMessage}`; // Combine data
      console.log('Encoded Data:', encodedData); // Log encoded data for debugging
      return encodedData;
  } catch (error) {
      console.error('Failed to encode form data:', error);
      alert('Error processing form data. Please check your inputs and try again.');
      return null;
  }
}

// Function to validate form data
function validateFormData(formData) {
  // Example validation: ensure that at least one checkbox is checked
  const isAnyCheckboxChecked = Array.from(formData.entries()).some(([key, value]) => key.startsWith('choice') && value === 'on');
  return isAnyCheckboxChecked;
}

// Attach an event listener to the form for the submit event
document.getElementById('formContainer').addEventListener('submit', function(event) {
  event.preventDefault();  // Prevent the form from submitting normally

  const formData = new FormData(event.target);  // Gather form data
  if (!validateFormData(formData)) {
      alert('Please check at least one checkbox.');
      return;
  }

  const encodedData = encodeFormData(formData);  // Encode the form data
  if (!encodedData) {
      alert('Failed to process form data. Please try again.');
      return;
  }

  // Show loading or processing indicator
  document.getElementById('loadingIndicator').style.display = 'block';

  window.location = `/cards/${encodedData}`;  // Redirect to the server with encoded data
});

// Optionally hide the loading indicator on load
document.addEventListener('DOMContentLoaded', () => {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
  }
});
