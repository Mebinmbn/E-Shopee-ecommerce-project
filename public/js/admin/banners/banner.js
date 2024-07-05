$(document).ready(function () {
  $("#banner_image").on("change", (e) => {
    let file = e.target.files[0];
    if (file) {
      // Create a new FileReader to read the selected image file
      var reader = new FileReader();
      reader.onload = function (event) {
        // Set the source of the image element to the selected file
        $("#banner_prev").attr("src", event.target.result);

        // Store the base64 string in the hidden input
        $("#cropped_banner").val(event.target.result);

        // Show the button group
        $(".button-grp").show();

        // Show success alert
        Swal.fire({
          title: "Success!",
          text: "Your image has been selected.",
          icon: "success",
        });
      };
      reader.readAsDataURL(file);
    }
  });

  $("#new-banner").validate({
    rules: {
      banner_name: {
        required: true,
        maxlength: 20,
      },
      banner_image: {
        required: true,
      },
      reference: {
        required: true,
      },
    },
    submitHandler: function (form) {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to add a new Banner?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0061bc",
        cancelButtonColor: "rgb(128, 128, 128)",
        confirmButtonText: "Yes",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const formData = new FormData(form);
            const base64String =
              document.getElementById("cropped_banner").value;
            const base64Data = base64String.split(",")[1];
            const binaryData = atob(base64Data);
            const uint8Array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], {
              type: "image/png",
            });
            const file = new File([blob], "image.png", {
              type: "image/png",
            });
            formData.append("banner_image", file);

            let res = await fetch("/admin/banners/add-banner", {
              method: "POST",
              body: formData,
            });
            let data = await res.json();
            if (data.success) {
              Swal.fire(
                "Created!",
                "New banner has been created successfully.",
                "success"
              ).then(() => location.assign("/admin/banners"));
            } else {
              throw new Error(data.message);
            }
          } catch (e) {
            Swal.fire("Error!", e.message, "error");
          }
        }
      });
    },
  });
});

// edit banner
$("#edit-banner").validate({
  rules: {
    banner_name: {
      required: true,
      maxlength: 20,
    },
    reference: {
      required: true,
    },
  },
  submitHandler: function (form) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to Edit this Banner?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0061bc",
      cancelButtonColor: "rgb(128, 128, 128)",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const form = document.getElementById("edit-banner");
        try {
          const formData = new FormData(form);
          let body = Object.fromEntries(formData);
          let id = body.banner_id;
          const image_string = document.getElementById("cropped_banner").value;
          if (image_string) {
            const base64String = image_string;
            const base64Data = base64String.split(",")[1];
            const binaryData = atob(base64Data);
            const uint8Array = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([uint8Array], {
              type: "image/png",
            });
            const file = new File([blob], "image.png", {
              type: "image/png",
            });
            formData.append("banner_image", file);
            let res = await fetch(`/admin/banners/edit-banner/${id}`, {
              method: "POST",
              body: formData,
            });
            let data = await res.json();
            if (data.success) {
              Swal.fire(
                "Editted!",
                "Banner Edited successfully.",
                "success"
              ).then(() => location.assign("/admin/banners"));
            } else {
              throw new Error(data.message);
            }
          } else {
            let res = await fetch(`/admin/banners/edit-banner/${id}`, {
              method: "POST",
              body: JSON.stringify(body),
              headers: { "Content-Type": "application/json" },
            });
            let data = await res.json();
            if (data.success) {
              Swal.fire(
                "Editted!",
                "Banner Edited successfully.",
                "success"
              ).then(() => location.assign("/admin/banners"));
            } else {
              throw new Error(data.message);
            }
          }
        } catch (e) {
          Swal.fire("Error!", e.message, "error");
        }
      }
    });
  },
});

// deleting banner
const deleteBanner = (id, imageName) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetch(`/admin/banners/delete-banner?id=${id}&image=${imageName}`)
          .then((responses) => responses.json())
          .then((data) => {
            if (data.success) {
              Swal.fire(
                "Deleted!",
                "Your file has been deleted.",
                "success"
              ).then(() => {
                location.assign("/admin/banners");
              });
            }
          });
      } catch (err) {
        console.log(err);
      }
    }
  });
};
