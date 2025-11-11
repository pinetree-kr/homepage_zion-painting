'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Tag, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Card } from '@/src/shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/ui';
import { Badge } from '@/src/shared/ui';
import { EditorComponent } from './EditorComponent';
import { toast } from 'sonner';
import { Product } from '@/src/entities';
import { DataTable, DataTableColumn, DataTableAction } from '@/src/shared/ui';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: '자동 도장 라인',
      content: '고효율 자동 도장 시스템',
      category: '도장설비',
      specs: ['자동화', '고효율'],
      createdAt: '2024-01-15',
      status: 'published',
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newSpec, setNewSpec] = useState('');

  const categories = ['도장설비', '건조설비', '이송설비', '환경설비'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      title: '',
      content: '',
      category: categories[0],
      specs: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft',
    };
    setSelectedProduct(newProduct);
    setIsEditDialogOpen(true);
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const saveProduct = () => {
    if (selectedProduct) {
      const exists = products.find(p => p.id === selectedProduct.id);
      if (exists) {
        setProducts(products.map(p =>
          p.id === selectedProduct.id ? selectedProduct : p
        ));
      } else {
        setProducts([...products, selectedProduct]);
      }
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast.success('제품이 저장되었습니다.');
    }
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success('제품이 삭제되었습니다.');
  };

  const addSpec = () => {
    if (selectedProduct && newSpec.trim()) {
      setSelectedProduct({
        ...selectedProduct,
        specs: [...selectedProduct.specs, newSpec.trim()],
      });
      setNewSpec('');
    }
  };

  const removeSpec = (index: number) => {
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        specs: selectedProduct.specs.filter((_, i) => i !== index),
      });
    }
  };

  const productColumns: DataTableColumn<Product>[] = [
    {
      id: 'title',
      header: '제품명',
      accessor: (row) => row.title,
      sortable: true,
      width: '25%'
    },
    {
      id: 'category',
      header: '카테고리',
      accessor: (row) => (
        <Badge variant="outline" className="text-xs">
          <Tag className="h-3 w-3 mr-1" />
          {row.category}
        </Badge>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'specs',
      header: '사양',
      accessor: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.specs.slice(0, 3).map((spec, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {spec}
            </Badge>
          ))}
          {row.specs.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.specs.length - 3}
            </Badge>
          )}
        </div>
      ),
      width: '30%'
    },
    {
      id: 'status',
      header: '상태',
      accessor: (row) => (
        <Badge variant={row.status === 'published' ? 'default' : 'secondary'} className="text-xs">
          {row.status === 'published' ? (
            <><CheckCircle className="h-3 w-3 mr-1" />공개</>
          ) : (
            <><XCircle className="h-3 w-3 mr-1" />비공개</>
          )}
        </Badge>
      ),
      sortable: true,
      width: '15%'
    },
    {
      id: 'createdAt',
      header: '등록일',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {row.createdAt}
        </div>
      ),
      sortable: true,
      width: '15%'
    }
  ];

  const productActions: DataTableAction<Product>[] = [
    {
      label: '수정',
      icon: <Edit className="h-4 w-4" />,
      onClick: editProduct
    },
    {
      label: '삭제',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => removeProduct(row.id),
      variant: 'destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-semibold">제품소개 관리</h2>
          <p className="text-gray-500 text-sm mt-1">제품 정보를 관리합니다</p>
        </div>
        <Button onClick={addProduct} className="gap-2">
          <Plus className="h-4 w-4" />
          제품 추가
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제품명 검색..."
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={filteredProducts}
          columns={productColumns}
          actions={productActions}
          getRowId={(row) => row.id}
          emptyMessage="등록된 제품이 없습니다"
        />
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>제품 {selectedProduct?.id ? '수정' : '추가'}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>제품명</Label>
                  <Input
                    value={selectedProduct.title}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, title: e.target.value })}
                    placeholder="제품명 입력"
                  />
                </div>
                <div>
                  <Label>카테고리</Label>
                  <Select
                    value={selectedProduct.category}
                    onValueChange={(value) => setSelectedProduct({ ...selectedProduct, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>제품 사양</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                      placeholder="사양 입력"
                      onKeyPress={(e) => e.key === 'Enter' && addSpec()}
                    />
                    <Button onClick={addSpec} type="button">추가</Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.specs.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {spec}
                        <button onClick={() => removeSpec(index)} className="ml-1">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>상태</Label>
                <Select
                  value={selectedProduct.status}
                  onValueChange={(value: 'published' | 'draft') => setSelectedProduct({ ...selectedProduct, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">공개</SelectItem>
                    <SelectItem value="draft">비공개</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>제품 설명</Label>
                <EditorComponent
                  initialValue={selectedProduct.content}
                  onChange={(content) => setSelectedProduct({ ...selectedProduct, content })}
                  height="400px"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={saveProduct}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

