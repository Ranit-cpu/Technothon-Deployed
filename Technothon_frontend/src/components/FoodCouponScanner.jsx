export default function FoodCouponScanner() {
  const [scannedData, setScannedData] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleScan = async (result) => {
    if (result?.text && result.text !== scannedData) {
      setScannedData(result.text);
      toast.success("Coupon scanned! Verifying...");
      await verifyCoupon(result.text);
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
    toast.error("Scanner error. Please try again.");
  };

  const verifyCoupon = async (couponCode) => {
    setIsVerifying(true);
    try {
      const res = await api.post("/admin/verify_coupon", { coupon: couponCode });
      if (res.data.valid) {
        toast.success(`Coupon valid ✅ - ${res.data.user || "User"}`);
      } else {
        toast.error("Invalid coupon ❌");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };