(() => {
  const tickboxes = [
    document.getElementById('tick1'),
    document.getElementById('tick2'),
    document.getElementById('tick3'),
    document.getElementById('tick4')
  ];

  function initializeTickboxes() {
    tickboxes.forEach((tb, i) => {
      tb.dataset.checked = i < 2 ? "true" : "false";
      tb.src = i < 2 ? "tick.png" : "untick.png";
    });
  }

  function toggleTickbox(index) {
    const tb = tickboxes[index];
    const isChecked = tb.dataset.checked === "true";

    if (!isChecked) {
      for (let i = 0; i <= index; i++) {
        tickboxes[i].dataset.checked = "true";
        tickboxes[i].src = "tick.png";
      }
    } else {
      for (let i = index + 1; i < tickboxes.length; i++) {
        if (tickboxes[i].dataset.checked === "true") return;
      }
      for (let i = index; i < tickboxes.length; i++) {
        tickboxes[i].dataset.checked = "false";
        tickboxes[i].src = "untick.png";
      }
    }

    console.log(`Ticked states:`, tickboxes.map(tb => tb.dataset.checked));
  }

  tickboxes.forEach((tb, i) => {
    tb.addEventListener('click', () => toggleTickbox(i));
  });

  initializeTickboxes();