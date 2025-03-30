import Swal from 'sweetalert2';

export const showConfirmation = async (options = {}) => {
    const {
        title = 'Are you sure?',
        text = 'This action cannot be undone.',
        icon = 'warning',
        confirmButtonText = 'Yes, proceed!',
        cancelButtonText = 'No, cancel',
        confirmButtonColor = '#3085d6',
        cancelButtonColor = '#d33',
    } = options;

    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText,
        cancelButtonText,
    });

    return result.isConfirmed;
};

export const showSuccess = (options = {}) => {
    const {
        title = 'Success!',
        text = 'Operation completed successfully.',
        timer = 1500,
    } = options;

    return Swal.fire({
        title,
        text,
        icon: 'success',
        timer,
        showConfirmButton: false,
    });
};

export const showError = (options = {}) => {
    const {
        title = 'Error!',
        text = 'Something went wrong. Please try again.',
    } = options;

    return Swal.fire({
        title,
        text,
        icon: 'error',
    });
};

