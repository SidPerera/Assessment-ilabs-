// Function to load questions from localStorage
function loadQuestions(pageNumber, pageSize, searchText) {
    const data = JSON.parse(localStorage.getItem('questionData')) || [];
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const filteredData = searchText
      ? data.filter(item => item.question.toLowerCase().includes(searchText.toLowerCase()))
      : data.slice(startIndex, endIndex);
  
    let tableRows = '';
    filteredData.forEach((item, index) => {
      const { category, question, status, deactivated } = item;
      tableRows += `
        <tr>
          <td>${startIndex + index + 1}</td>
          <td class="${deactivated ? 'deactivated' : ''}">${question}</td>
          <td>${category}</td>
          <td>${deactivated ? 'Draft' : status}</td>
          <td>
            <button class="deleteBtn" data-index="${startIndex + index}">Delete</button>
            <button class="deactivateBtn" data-index="${startIndex + index}">
              ${deactivated ? 'Activate' : 'Deactivate'}
            </button>
          </td>
        </tr>
      `;
    }); 
    $('#questionTable tbody').html(tableRows);
}
  

// Function to add a new question to localStorage
function addQuestion(question, category, status) {
    const data = JSON.parse(localStorage.getItem('questionData')) || [];
    data.push({ question, category, status, deactivated: false });
    localStorage.setItem('questionData', JSON.stringify(data));
}

// Function to remove a question from localStorage
function deleteQuestion(index) {
    const data = JSON.parse(localStorage.getItem('questionData')) || [];
    data.splice(index, 1);
    localStorage.setItem('questionData', JSON.stringify(data));
}

// Function to deactivate a question in localStorage
function deactivateQuestion(index) {
    const data = JSON.parse(localStorage.getItem('questionData')) || [];
    data[index].deactivated = !data[index].deactivated;
    if (data[index].deactivated) {
      data[index].status = 'Draft'; // Set the status to 'Draft' when the question is deactivated
    }
    localStorage.setItem('questionData', JSON.stringify(data));
}


const pageSize = 5; // Number of questions per page
let currentPage = 1;

// Load questions on page load
loadQuestions(currentPage, pageSize);

$('#addQuestionBtn').on('click', function () {
    $('#addQueModal').show();
});

$('#cancelBtn').on('click', function() {
    $('#addQueModal').hide();
});

$('#addQueModal form').on('submit', function (e) {
    e.preventDefault();
    const question = $('#question').val().trim();
    const category = $('#category').val().trim();
    const status = $('#status').val(); // Get the selected status
    
    if (question !== '' && category !== '') {
        addQuestion(question, category, status); // Pass the status to addQuestion function
        loadQuestions(currentPage, pageSize); // Reload the current page after adding a new question
        $('#question').val('');
        $('#category').val('');
        $('#status').val('Published'); // Reset the status dropdown to 'Published'
        $('#addQueModal').hide();
    }
});

// Search functionality
$('#searchBtn').on('click', function () {
    const searchText = $('#textArea').val().trim();
    loadQuestions(currentPage, pageSize, searchText); // Pass the searchText to loadQuestions function
});

// Pagination
$('#prevPage').on('click', function () {
    if (currentPage > 1) {
        currentPage--;
        loadQuestions(currentPage, pageSize);
    }
});

$('#nextPage').on('click', function () {
    const totalQuestions = JSON.parse(localStorage.getItem('questionData')) || [];
    const totalPages = Math.ceil(totalQuestions.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        loadQuestions(currentPage, pageSize);
    }
});

// Sorting for each column
let sortColumn = '';
let sortOrder = 1; // 1 for ascending, -1 for descending

function sortQuestions(column) {
    const data = JSON.parse(localStorage.getItem('questionData')) || [];

    data.sort((a, b) => {
      const valA = a[column].toLowerCase();
      const valB = b[column].toLowerCase();

      if (column === 'question' || column === 'category') {
        return valA.localeCompare(valB) * sortOrder;
      } else if (column === 'status') {
        // Custom sorting logic for status: Published first, then Draft
        return (valA === 'published' ? -1 : 1) * sortOrder;
      } else {
        // If sorting by index, maintain numeric sorting
        return (a - b) * sortOrder;
      }
    });

    localStorage.setItem('questionData', JSON.stringify(data));
    loadQuestions(currentPage, pageSize); // Reload the current page after sorting
}

$(document).on('click', 'th.sortable', function () {
    const column = $(this).text().trim();
    if (column === sortColumn) {
      sortOrder *= -1; // Toggle the sorting order for the same column
    } else {
      sortColumn = column;
      sortOrder = 1; // Reset sorting order for a new column
    }
    sortQuestions(column);
    
    // Update the sortable class and Font Awesome icons based on the sorting direction
    $('th.sortable').removeClass('sorted-asc sorted-desc');
    $(this).addClass(sortOrder === 1 ? 'sorted-asc' : 'sorted-desc');
});

// Delete question functionality
$(document).on('click', '.deleteBtn', function () {
    const index = $(this).data('index');
    deleteQuestion(index);
    loadQuestions(currentPage, pageSize); // Reload the current page after deleting a question
});

// Deactivate question functionality
$(document).on('click', '.deactivateBtn', function () {
    const index = $(this).data('index');
    deactivateQuestion(index);
    loadQuestions(currentPage, pageSize); // Reload the current page after deactivating a question
});



