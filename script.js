
const imageUploadArea = $("#imageuploadarea");
const fileInputField = $("#fileinputfield");
const imagesGrid = $("#imagesgrid");
const imageUploadBtn = $("#imageuploadbtn");
const navLinkItems = $('.navbar-nav .nav-link');

$(document).ready(function () {
  $.ajax({
    url: "http://numbersapi.com/1/30/date?json",
    method: "GET",
    success: function (data) {
      $("#fitnessfact").text(data.text);
    }
  });
  GetImages();
});

navLinkItems.click(function() {
  navLinkItems.removeClass('active');
  $(this).addClass('active');
});

imageUploadArea.on("click", function () {
    fileInputField.click();
});

imageUploadBtn.on("click", function (e) {
    e.stopPropagation();
    fileInputField.click();
});
fileInputField.on("click", function (e) {
    e.stopPropagation();
});
imageUploadArea.on("dragover", function (e) {
    e.preventDefault();
    imageUploadArea.addClass("bg-info");
});

imageUploadArea.on("dragleave drop", function (e) {
    e.preventDefault();
    imageUploadArea.removeClass("bg-info");
});

imageUploadArea.on("drop", function (e) {
    e.preventDefault();
    UploadImages(e.originalEvent.dataTransfer.files);
});

fileInputField.on("change", function () {
    UploadImages(this.files);
});

function UploadImages(files) {
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
        formData.append("images", file);
    }

    $.ajax({
        url: "/uploadimages",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: () => {
            ClearAllToasts();
            ShowToastMsg(`Uploading ${files.length} file(s)...`, "info");
        },
        success: function (res) {
            ClearAllToasts();
            ShowToastMsg(res.message, "success");
            GetImages();
        },
        error: function () {
            ClearAllToasts();
            ShowToastMsg("Upload failed. Please try again.", "danger");
        }
    });
}

function GetImages() {
    $.ajax({
        url: "/getimagesnative",
        method: "GET",
        success: function (res) {
            imagesGrid.empty();
            if (res.files.length === 0) {
                imagesGrid.html(
                "<p class='text-center text-muted'>No images uploaded yet.</p>"
                );
                return;
            }

            for (const file of res.files) {
                const col = $(`
                <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card shadow-sm">
                    <img src="${file.url}" alt="${file.name}" class="card-img-top" />
                    <div class="card-body p-2 text-center">
                        <small class="text-truncate d-block" title="${file.name}">${file.name}</small>
                    </div>
                    </div>
                </div>
                `);
                imagesGrid.append(col);
            }
        },
        error: function () {
            ClearAllToasts();
            ShowToastMsg("Failed to load images.", "danger");
        }
    });
}
function ShowToastMsg(message, type = "info") {
    const toastId = `toast-${Date.now()}`;
    const toast = $(`
        <div id="${toastId}" class="alert alert-${type} alert-dismissible fade show" role="alert" style="margin-bottom: 0.5rem;">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    $("#toastmsgdiv").append(toast);

    setTimeout(() => {
        $(`#${toastId}`).alert('close');
    }, 5000);
}
function ClearAllToasts() {
    $("#toastmsgdiv").empty();
}
