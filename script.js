document.addEventListener("DOMContentLoaded", () => {
  // --- MODAL SETUP (keep existing) ---
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <div id="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".close-btn");
  const modalBody = modal.querySelector("#modal-body");

  // Close modal when clicking X or outside content
  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // --- SWIPE FUNCTIONALITY ---
  const cardsStack = document.getElementById("cards-stack");
  const cards = Array.from(cardsStack.querySelectorAll(".swipe-card"));
  const passBtn = document.getElementById("pass-btn");
  const contactBtn = document.getElementById("contact-btn");
  const noMoreCards = document.getElementById("no-more-cards");

  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let currentCard = null;
  let startTime = 0;

  // Initialize cards
  function updateCardStack() {
    cards.forEach((card, index) => {
      if (index < currentIndex) {
        // Hide swiped cards
        card.style.display = "none";
        card.style.pointerEvents = "none";
      } else {
        card.style.display = "block";
        card.style.pointerEvents = "auto";
        const position = index - currentIndex;
        
        // Remove all swipe-related classes
        card.classList.remove("swiped-left", "swiped-right", "swiping", "swiping-left", "swiping-right");
        
        if (position === 0) {
          // Top card - fully visible and interactive
          card.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
          card.style.transform = "";
          card.style.opacity = "1";
          card.style.zIndex = "4";
        } else if (position === 1) {
          // Second card - slightly scaled and offset
          card.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
          card.style.transform = "scale(0.96) translateY(-8px)";
          card.style.opacity = "0.95";
          card.style.zIndex = "3";
        } else if (position === 2) {
          // Third card
          card.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
          card.style.transform = "scale(0.92) translateY(-16px)";
          card.style.opacity = "0.9";
          card.style.zIndex = "2";
        } else {
          // Fourth card and beyond
          card.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease";
          card.style.transform = "scale(0.88) translateY(-24px)";
          card.style.opacity = "0.85";
          card.style.zIndex = "1";
        }
      }
    });

    // Check if no more cards
    if (currentIndex >= cards.length) {
      cardsStack.style.display = "none";
      noMoreCards.style.display = "block";
      passBtn.style.display = "none";
      contactBtn.style.display = "none";
    } else {
      cardsStack.style.display = "block";
      noMoreCards.style.display = "none";
      passBtn.style.display = "";
      contactBtn.style.display = "";
    }
  }

  // Get current card
  function getCurrentCard() {
    return cards[currentIndex];
  }

  // Swipe card left (Pass)
  function swipeLeft() {
    const card = getCurrentCard();
    if (!card) return;

    // Prevent multiple rapid swipes
    if (card.classList.contains("swiped-left") || card.classList.contains("swiped-right")) {
      return;
    }

    card.style.transition = "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease-out";
    card.classList.add("swiped-left");
    card.style.transform = `translateX(-200%) rotate(-35deg)`;
    card.style.opacity = "0";
    card.style.zIndex = "10";

    setTimeout(() => {
      currentIndex++;
      updateCardStack();
      // Reattach listeners to new current card
      const nextCard = getCurrentCard();
      if (nextCard) {
        attachSwipeListeners(nextCard);
      }
    }, 400);
  }

  // Swipe card right (Contact)
  function swipeRight() {
    const card = getCurrentCard();
    if (!card) return;

    // Prevent multiple rapid swipes
    if (card.classList.contains("swiped-left") || card.classList.contains("swiped-right")) {
      return;
    }

    // Get lawyer data before removing card
    const lawyerData = JSON.parse(card.getAttribute("data-lawyer"));

    card.style.transition = "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease-out";
    card.classList.add("swiped-right");
    card.style.transform = `translateX(200%) rotate(35deg)`;
    card.style.opacity = "0";
    card.style.zIndex = "10";

    // Open contact modal after a short delay
    setTimeout(() => {
      showContactModal(lawyerData);
    }, 200);

    setTimeout(() => {
      currentIndex++;
      updateCardStack();
      // Reattach listeners to new current card
      const nextCard = getCurrentCard();
      if (nextCard) {
        attachSwipeListeners(nextCard);
      }
    }, 400);
  }

  // Show contact modal
  function showContactModal(lawyerData) {
    modalBody.innerHTML = `
      <h2>Contact ${lawyerData.name}</h2>
      <p><strong>Specialty:</strong> ${lawyerData.specialty}</p>
      <p><strong>Location:</strong> ${lawyerData.location}</p>
      <div style="margin-top: 1.5rem;">
        <p><strong>Email:</strong> contact@lawyerconnect.com</p>
        <p><strong>Phone:</strong> +49 123 456 7890</p>
      </div>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
        <button class="chat-btn" style="background: linear-gradient(120deg, #4e9fff, #6fb1fc); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 2rem; cursor: pointer;">💬 Chat</button>
        <button class="book-btn" style="background: linear-gradient(120deg, #6bcf63, #4bd18b); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 2rem; cursor: pointer;">📅 Book</button>
      </div>
    `;
    modal.classList.add("active");

    // Add event listeners for chat and book buttons in modal
    const chatBtnInModal = modalBody.querySelector(".chat-btn");
    const bookBtnInModal = modalBody.querySelector(".book-btn");

    if (chatBtnInModal) {
      chatBtnInModal.addEventListener("click", () => {
        modalBody.innerHTML = `
          <h2>Chat with ${lawyerData.name}</h2>
          <div class="chat-box">
            <p><strong>${lawyerData.name}:</strong> Hello! How can I help you today?</p>
            <input type="text" placeholder="Type your message..." autofocus />
            <button class="send-btn">Send</button>
          </div>
        `;
      });
    }

    if (bookBtnInModal) {
      bookBtnInModal.addEventListener("click", () => {
        modalBody.innerHTML = `
          <h2>Book Appointment with ${lawyerData.name}</h2>
          <form class="book-form">
            <label>Your Name:</label>
            <input type="text" placeholder="Enter your name" required />
            <label>Select Date:</label>
            <input type="date" required />
            <button type="submit">Confirm Booking</button>
          </form>
        `;
        const bookForm = modalBody.querySelector(".book-form");
        if (bookForm) {
          bookForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Booking confirmed!");
            modal.classList.remove("active");
          });
        }
      });
    }
  }

  // Mouse move handler (global)
  function handleGlobalMouseMove(e) {
    if (!isDragging) return;
    handleMove(e);
  }

  // Mouse up handler (global)
  function handleGlobalMouseUp(e) {
    if (!isDragging) return;
    handleEnd(e);
  }

  // Touch events
  function handleStart(e) {
    const card = getCurrentCard();
    if (!card) return;

    isDragging = true;
    currentCard = card;
    card.classList.add("swiping");
    startTime = Date.now();

    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    offsetX = 0;
    offsetY = 0;

    // Add global mouse listeners for desktop
    if (!e.touches) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }
  }

  function handleMove(e) {
    if (!isDragging || !currentCard) return;
    
    const touch = e.touches ? e.touches[0] : e;
    currentX = touch.clientX;
    currentY = touch.clientY;
    offsetX = currentX - startX;
    offsetY = currentY - startY;

    // Prevent default scrolling if horizontal swipe is dominant
    if (Math.abs(offsetX) > Math.abs(offsetY) && e.type === "touchmove") {
      e.preventDefault();
    }

    // Only rotate and translate if horizontal movement is significant
    // This prevents accidental swipes when scrolling vertically
    if (Math.abs(offsetX) > 10 || Math.abs(offsetY) < Math.abs(offsetX)) {
      const rotation = offsetX * 0.1;
      // Limit vertical movement to prevent too much upward/downward drag
      const limitedOffsetY = Math.abs(offsetY) > Math.abs(offsetX) ? offsetY * 0.3 : offsetY * 0.5;
      currentCard.style.transform = `translate(${offsetX}px, ${limitedOffsetY}px) rotate(${rotation}deg)`;
    }

    // Show indicators only for horizontal swipes
    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      if (offsetX < -50) {
        currentCard.classList.remove("swiping-right");
        currentCard.classList.add("swiping-left");
      } else if (offsetX > 50) {
        currentCard.classList.remove("swiping-left");
        currentCard.classList.add("swiping-right");
      } else {
        currentCard.classList.remove("swiping-left", "swiping-right");
      }
    }
  }

  function handleEnd(e) {
    if (!isDragging || !currentCard) return;

    const card = currentCard;
    isDragging = false;
    card.classList.remove("swiping");

    // Remove global mouse listeners
    document.removeEventListener("mousemove", handleGlobalMouseMove);
    document.removeEventListener("mouseup", handleGlobalMouseUp);

    const threshold = 100;
    const swipeDuration = Date.now() - startTime;
    const isHorizontalSwipe = Math.abs(offsetX) > Math.abs(offsetY);
    
    // Only process swipe if it's primarily horizontal
    if (isHorizontalSwipe) {
      // Check if swipe is significant enough or has enough velocity (fast swipe)
      if (Math.abs(offsetX) > threshold || (swipeDuration < 300 && Math.abs(offsetX) > 50)) {
        if (offsetX < 0) {
          swipeLeft();
        } else {
          swipeRight();
        }
      } else {
        // Snap back to center with smooth animation
        card.style.transition = "transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        card.style.transform = "";
        card.classList.remove("swiping-left", "swiping-right");
        
        // Reset transition after animation
        setTimeout(() => {
          card.style.transition = "";
        }, 300);
      }
    } else {
      // Vertical movement - just snap back without treating as swipe
      card.style.transition = "transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      card.style.transform = "";
      card.classList.remove("swiping-left", "swiping-right");
      
      setTimeout(() => {
        card.style.transition = "";
      }, 300);
    }

    currentCard = null;
    offsetX = 0;
    offsetY = 0;
  }

  // Add event listeners to current card
  function attachSwipeListeners(card) {
    if (!card) return;
    
    // Touch events
    card.addEventListener("touchstart", handleStart, { passive: false });
    card.addEventListener("touchmove", handleMove, { passive: false });
    card.addEventListener("touchend", handleEnd, { passive: true });

    // Mouse events (for desktop) - only mousedown on card, move/up handled globally
    card.addEventListener("mousedown", (e) => {
      e.preventDefault();
      handleStart(e);
    });
  }

  // Button click handlers
  passBtn.addEventListener("click", () => {
    swipeLeft();
  });

  contactBtn.addEventListener("click", () => {
    swipeRight();
  });

  // Initialize
  updateCardStack();
  if (getCurrentCard()) {
    attachSwipeListeners(getCurrentCard());
  }

  // --- BURGER MENU SETUP ---
  const menuIcon = document.getElementById("menu-icon");
  const menu = document.getElementById("menu");

  if (menuIcon && menu) {
    menuIcon.addEventListener("click", () => {
      menu.classList.toggle("show");
    });
  }
});
