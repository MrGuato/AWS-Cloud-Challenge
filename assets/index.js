// Javascript Code
const counter = document.getElementById("counter-number");

async function updateCounter() {
  try {
    let response = await fetch("https://syjqj5dnxt66uppllhlubt5zbm0nsrdm.lambda-url.us-east-1.on.aws/");
    let data = await response.json();
    // Replace 'count' with the actual property name that holds the visitor count in your JSON response
    counter.textContent = `Views: ${data}`;
  } catch (error) {
    console.error('Error fetching and updating counter:', error);
    counter.textContent = 'Views: unavailable';
  }
}

// Call the function to update the counter
updateCounter();
