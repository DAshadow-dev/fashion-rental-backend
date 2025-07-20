import cron from "node-cron";
import Rental from "../models/rental.model";
import Product from "../models/product.model";

/**
 * Service để xử lý tự động cập nhật trạng thái rental
 */
export class RentalScheduleService {

  /**
   * Khởi tạo các scheduled jobs
   */
  static initScheduledJobs() {
    // Chạy mỗi giờ để check rentals đã hết hạn
    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled job: Auto return expired rentals');
      await this.autoReturnExpiredRentals();
    });

    console.log('Rental schedule service initialized');
  }

  /**
   * Tự động cập nhật status = RETURNED cho các rental đã hết hạn
   */
  static async autoReturnExpiredRentals() {
    try {
      const now = new Date();

      // Tìm các rental đã hết hạn nhưng chưa được trả
      const expiredRentals = await Rental.find({
        rentalEnd: { $lte: now },
        status: { $in: ["APPROVED"] } // Chỉ auto return những rental đã được approve
      }).populate("productId");

      console.log(`Found ${expiredRentals.length} expired rentals to auto return`);

      for (const rental of expiredRentals) {
        // Cập nhật status rental thành RETURNED
        await Rental.findByIdAndUpdate(rental._id, {
          status: "RETURNED"
        });

        // Cập nhật sản phẩm về trạng thái available
        if (rental.productId) {
          await Product.findByIdAndUpdate(rental.productId._id, {
            available: true
          });
        }

        console.log(`Auto returned rental ${rental._id} for product ${rental.productId?._id}`);
      }

      return {
        success: true,
        processedCount: expiredRentals.length
      };
    } catch (error) {
      console.error('Error in auto return expired rentals:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Kiểm tra xem rental có thể cancel không
   */
  static canCancelRental(rental: any): { canCancel: boolean; reason?: string } {
    // Kiểm tra rental có tồn tại và có đầy đủ thông tin không
    if (!rental || !rental.rentalStart || !rental.status) {
      return {
        canCancel: false,
        reason: "Invalid rental data"
      };
    }

    const now = new Date();
    const rentalStart = new Date(rental.rentalStart);

    // Kiểm tra rentalStart có valid không
    if (isNaN(rentalStart.getTime())) {
      return {
        canCancel: false,
        reason: "Invalid rental start date"
      };
    }

    // Nếu rental đã bắt đầu hơn 24 giờ thì không thể cancel
    const hoursAfterStart = (now.getTime() - rentalStart.getTime()) / (1000 * 60 * 60);

    if (hoursAfterStart > 24 && rental.status !== "PENDING") {
      return {
        canCancel: false,
        reason: "Cannot cancel rental after 24 hours from start date"
      };
    }

    // Chỉ có thể cancel rental ở trạng thái PENDING hoặc APPROVED
    if (!["PENDING", "APPROVED"].includes(rental.status)) {
      return {
        canCancel: false,
        reason: `Cannot cancel rental with status: ${rental.status}`
      };
    }

    return { canCancel: true };
  }

  /**
   * Manual trigger để test auto return
   */
  static async manualTriggerAutoReturn() {
    console.log('Manual trigger: Auto return expired rentals');
    return await this.autoReturnExpiredRentals();
  }
}

export default RentalScheduleService;
