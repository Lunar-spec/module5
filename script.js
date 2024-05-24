document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');
    const recordsTable = document.getElementById('recordsTableBody');
    const uploadIcon = document.getElementById('uploadIcon');
    const studentPhotoInput = document.getElementById('studentPhoto');
    const fileName = document.getElementById('fileName');
    const contactNoInput = document.getElementById('contactNo');

    // Loading of records from localStorage
    loadRecordsFromLocalStorage();

    // Loading data from localStorage
    function loadRecordsFromLocalStorage() {
        const records = JSON.parse(localStorage.getItem('studentRecords')) || [];
        records.forEach(function (record) {
            const newRow = recordsTable.insertRow();
            const photoCell = newRow.insertCell(0);
            const nameCell = newRow.insertCell(1);
            const idCell = newRow.insertCell(2);
            const emailCell = newRow.insertCell(3);
            const contactCell = newRow.insertCell(4);
            const actionsCell = newRow.insertCell(5);
            // Populate cells with data
            photoCell.innerHTML = `<img src="${record.studentPhoto}" alt="student photo" width="50" height="50">`;
            nameCell.textContent = record.studentName;
            idCell.textContent = record.studentID;
            emailCell.textContent = record.email;
            contactCell.textContent = record.contactNo;

            // Create edit and delete buttons
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
            editBtn.classList.add('edit-btn');
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.classList.add('delete-btn');

            // Append buttons to actions cell
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
        });
    }

    // Event listener for upload icon
    uploadIcon.addEventListener('click', function () {
        studentPhotoInput.click();
    });

    // Event listener for file input change
    studentPhotoInput.addEventListener('change', function () {
        const file = studentPhotoInput.files[0];
        if (file) {
            const fileNameParts = file.name.split('.');
            const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
            if (['jpeg', 'jpg', 'png'].includes(fileExtension)) {
                fileName.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="photo" width="50" height="50">`;
            } else {
                alert('Please upload a JPEG, JPG, or PNG file.');
                studentPhotoInput.value = ''; // Clear the file input
                fileName.textContent = 'No file chosen';
            }
        } else {
            fileName.textContent = 'No file chosen';
        }
    });

    // Event listener for form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        addStudentRecord();
    });

    // Function to add student record
    async function addStudentRecord() {
        // Get form values
        const studentPhoto = studentPhotoInput.files[0];
        const studentName = document.getElementById('studentName').value;
        const studentID = document.getElementById('studentID').value;
        const email = document.getElementById('email').value;
        const contactNo = contactNoInput.value;

        // Validate student name using regular expression
        const namePattern = /^[A-Za-z\s]+$/;
        if (!namePattern.test(studentName)) {
            alert('Please enter a valid name with only alphabets.');
            return;
        }

        // Validate contact number using regular expression
        const contactPattern = /^[0-9]+$/;
        if (!contactPattern.test(contactNo)) {
            alert('Please enter a valid contact number.');
            return;
        }

        // Convert image to Base64
        let photoBase64 = '';
        if (studentPhoto) {
            photoBase64 = await fileToBase64(studentPhoto);
        }

        // Create a new row for the student record
        const newRow = recordsTable.insertRow();

        // Insert cells into the new row
        const photoCell = newRow.insertCell(0);
        const nameCell = newRow.insertCell(1);
        const idCell = newRow.insertCell(2);
        const emailCell = newRow.insertCell(3);
        const contactCell = newRow.insertCell(4);
        const actionsCell = newRow.insertCell(5);

        // Populate cells with data
        if (photoBase64) {
            photoCell.innerHTML = `<img src="${photoBase64}" alt="Student Photo" width="50" height="50">`;
        } else {
            photoCell.textContent = "No Photo";
        }

        nameCell.textContent = studentName;
        idCell.textContent = studentID;
        emailCell.textContent = email;
        contactCell.textContent = contactNo;

        // Create edit and delete buttons
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.classList.add('edit-btn');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.classList.add('delete-btn');

        // Append buttons to actions cell
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);

        saveRecordToLocalStorage({
            studentPhoto: photoBase64,
            studentName: studentName,
            studentID: studentID,
            email: email,
            contactNo: contactNo
        });

        // Clear the form fields
        form.reset();
        fileName.textContent = 'No file chosen';
    }

    // Event listener for edit and delete buttons using event delegation
    recordsTable.addEventListener('click', function (event) {
        const target = event.target.closest('button');
        if (target) {
            if (target.classList.contains('edit-btn')) {
                editStudentRecord(target.closest('tr'));
            } else if (target.classList.contains('save-btn')) {
                saveEditedRecord(target.closest('tr'));
            } else if (target.classList.contains('delete-btn')) {
                deleteStudentRecord(target.closest('tr'));
            }
        }
    });

    // Function to edit student record
    function editStudentRecord(recordRow) {
        // Get cells of the record row
        const cells = recordRow.cells;

        // Loop through cells and replace text content with input fields (excluding the photo cell)
        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            const text = cell.textContent.trim();
            cell.innerHTML = `<input type="text" value="${text}">`;
        }

        // Change button text to 'Save'
        const editBtn = recordRow.querySelector('.edit-btn');
        editBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
        editBtn.classList.remove('edit-btn');
        editBtn.classList.add('save-btn');
    }

    // Function to save edited student record
    function saveEditedRecord(recordRow) {
        // Get cells of the record row
        const cells = recordRow.cells;

        // Get the index of the row being edited
        const rowIndex = recordRow.rowIndex - 1;

        // Retrieve the records from localStorage
        const records = JSON.parse(localStorage.getItem('studentRecords')) || [];

        // Update the record object with new values
        const updatedRecord = {
            studentPhoto: records[rowIndex].studentPhoto, // Keep the existing photo
            studentName: cells[1].querySelector('input').value,
            studentID: cells[2].querySelector('input').value,
            email: cells[3].querySelector('input').value,
            contactNo: cells[4].querySelector('input').value
        };

        // Update the record in the records array
        records[rowIndex] = updatedRecord;

        // Save the updated records back to localStorage
        localStorage.setItem('studentRecords', JSON.stringify(records));

        // Loop through cells and replace input fields with text content (excluding the photo cell)
        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            const input = cell.querySelector('input');
            const value = input.value;
            cell.textContent = value;
        }

        // Change button text back to 'Edit'
        const saveBtn = recordRow.querySelector('.save-btn');
        saveBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        saveBtn.classList.remove('save-btn');
        saveBtn.classList.add('edit-btn');
    }

    // Deleting the record
    function deleteStudentRecord(recordRow) {
        const records = JSON.parse(localStorage.getItem('studentRecords')) || [];
        const rowIndex = recordRow.rowIndex - 1; // Adjust for header row
        records.splice(rowIndex, 1);
        localStorage.setItem('studentRecords', JSON.stringify(records));
        recordRow.remove();
    }
});

// Saving into the localStorage
async function saveRecordToLocalStorage(record) {
    const records = JSON.parse(localStorage.getItem('studentRecords')) || [];
    records.push(record);
    localStorage.setItem('studentRecords', JSON.stringify(records));
}

// Function to convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
