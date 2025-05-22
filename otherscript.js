document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('playBtn');
    const creditsBtn = document.getElementById('creditsBtn');
    const startButtons = document.getElementById('startButtons');
    const gameModes = document.getElementById('gameModes');
    const creditsModal = document.getElementById('creditsModal');
    const closeModalBtn = document.querySelector('.btn-close'); // For closing the modal
    const body = document.body;  // Reference to the body element

    // Initially hide the modal content (it’s hidden by default in Bootstrap, but we can add an extra check)
    creditsModal.classList.remove('show');
    creditsModal.style.display = 'none';

    // When Play button is clicked
    playBtn.addEventListener('click', () => {
        // Change background image to bg2.gif
        body.style.backgroundImage = "url('Images/bg2.gif')";
        
        // Hide the start buttons and show the game modes
        startButtons.style.display = 'none';
        gameModes.style.display = 'block';
        gameModes.scrollIntoView({ behavior: 'smooth' });

        // Ensure that the Credits modal is hidden when Play is pressed
        creditsModal.classList.remove('show');
        creditsModal.style.display = 'none';  // Hide the modal if it's visible
    });

    // When Credits button is clicked, show the modal
    creditsBtn.addEventListener('click', () => {
        creditsModal.classList.add('show');
        creditsModal.style.display = 'block'; // This will display the modal
    });

    // When the close button inside the modal is clicked, hide the modal
    closeModalBtn.addEventListener('click', () => {
        creditsModal.classList.remove('show');
        creditsModal.style.display = 'none'; // This will hide the modal
    });

    // Optional: If you want to hide the modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === creditsModal) {
            creditsModal.classList.remove('show');
            creditsModal.style.display = 'none';
        }
    });
});


  document.getElementById("returnToStart").addEventListener("click", function () {
    document.getElementById("gameModes").style.display = "none";
    document.getElementById("startButtons").style.display = "block";
  });

  document.getElementById("playBtn").addEventListener("click", function () {
    document.getElementById("startButtons").style.display = "none";
    document.getElementById("gameModes").style.display = "block";
  });


