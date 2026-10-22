const handleSaveProduct = async () => {
    if (!prodForm.name.trim() || !prodForm.price || !prodForm.location.trim() || !prodForm.city.trim()) {
      return showToast("⚠️ እባክዎ የእቃ ስም፣ ዋጋ፣ ከተማ እና አድራሻ ይሙሉ!");
    }

    if (!prodForm.image) {
      return showToast("⚠️ እባክዎ የእቃውን ፎቶ ያስገቡ!");
    }

    // 1. መረጃዎችን ለ Python ባክኤንድ በሚስማማ መልኩ በ FormData ማሸግ
    const formData = new FormData();
    formData.append('title', prodForm.name); // ባክኤንድ ላይ 'title' ስለሚል
    formData.append('price', String(prodForm.price));
    formData.append('category', prodForm.category);
    formData.append('condition', prodForm.condition);
    formData.append('city', prodForm.city);
    formData.append('location', prodForm.location);
    formData.append('has_delivery', String(prodForm.has_delivery));
    formData.append('delivery_fee', String(prodForm.has_delivery ? prodForm.delivery_fee : 0));
    formData.append('seller_username', 'admin');
    formData.append('store_name', adminBank.store_name || "EOTC Official Store");
    
    // የመጽሐፍ መረጃዎች ከሆኑ ብቻ መጨመር
    if (prodForm.category === 'መጽሐፍት') {
      formData.append('author', prodForm.author);
      formData.append('pub_year', prodForm.pub_year);
      formData.append('publisher', prodForm.publisher);
      formData.append('book_sub_category', prodForm.book_sub_category);
    }

    // 2. ፎቶውን (Canvas Base64) ወደ ትክክለኛ File (Blob) ቀይሮ ማያያዝ
    if (prodForm.image.startsWith('data:image')) {
      const arr = prodForm.image.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const fileBlob = new Blob([u8arr], { type: mime });
      
      formData.append('image', fileBlob, 'product_image.jpg');
    }

    try {
      const url = prodForm.id ? `${API_BASE_URL}/products/${prodForm.id}` : `${API_BASE_URL}/products`;
      const method = prodForm.id ? 'PUT' : 'POST';

      // 3. ወደ ባክኤንድ መላክ (ማሳሰቢያ፡ Content-Type አንጽፍም፣ fetch በራሱ ያዘጋጀዋል)
      const res = await fetch(url, {
        method: method,
        body: formData
      });

      if (res.ok) {
        showToast(prodForm.id ? "✏️ ማስታወቂያው ተስተካክሏል!" : "🎉 እቃው በገበያ ላይ ተጭኗል!");
        // ፎርሙን ባዶ ማድረግ
        setProdForm({
          id: null, name: '', price: '', category: 'መጽሐፍት', condition: 'አዲስ',
          city: 'አዲስ አበባ', location: '', has_delivery: true, delivery_fee: '100',
          quantity: '1', image: '', author: '', pub_year: '', publisher: '',
          book_sub_category: 'መንፈሳዊ', seller_username: 'admin'
        });
        fetchData(); // አዲሱን ዳታ ለማምጣት
      } else {
        const errorData = await res.json();
        console.error("Backend Error:", errorData);
        showToast("⚠️ ባክኤንዱ መረጃውን አልተቀበለውም።");
      }
    } catch (error) {
      console.error("Network Error:", error);
      showToast("⚠️ የኔትወርክ ችግር አጋጥሟል! ኢንተርኔትዎን ያረጋግጡ።");
    }
  };
