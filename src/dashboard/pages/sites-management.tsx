import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function SitesManagement() {
  const [sites, setSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newSite, setNewSite] = useState({ name: '', domain: '', description: '' });

  useEffect(() => {
    // Mock data - will connect to Admin API later
    setSites([
      {
        id: 1,
        name: '개인 블로그',
        domain: 'myblog.com',
        description: '개인 기술 블로그',
        commentsCount: 847,
        status: 'active',
        createdAt: '2024-01-10',
        lastActivity: '2024-01-15 14:30'
      },
      {
        id: 2,
        name: '기술 블로그',
        domain: 'techblog.kr',
        description: '프로그래밍 관련 글',
        commentsCount: 234,
        status: 'active',
        createdAt: '2024-01-12',
        lastActivity: '2024-01-15 13:45'
      },
      {
        id: 3,
        name: '회사 뉴스',
        domain: 'company-news.com',
        description: '회사 공지사항',
        commentsCount: 156,
        status: 'inactive',
        createdAt: '2024-01-08',
        lastActivity: '2024-01-14 09:20'
      }
    ]);
  }, []);

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSite = () => {
    const site = {
      id: sites.length + 1,
      ...newSite,
      commentsCount: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: '-'
    };
    setSites([...sites, site]);
    setNewSite({ name: '', domain: '', description: '' });
    onOpenChange();
  };

  const toggleSiteStatus = (siteId) => {
    setSites(sites.map(site =>
      site.id === siteId
        ? { ...site, status: site.status === 'active' ? 'inactive' : 'active' }
        : site
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">사이트 관리</h1>
          <p className="text-gray-600 mt-2">댓글 시스템이 설치된 사이트들을 관리하세요</p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="material-symbols:add" />}
          onPress={onOpen}
        >
          새 사이트 추가
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardBody className="p-4">
          <Input
            placeholder="사이트 이름이나 도메인으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Icon icon="material-symbols:search" className="text-gray-400" />}
            className="max-w-md"
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSites.map((site) => (
          <Card key={site.id} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                  <p className="text-sm text-gray-500">{site.domain}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    site.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {site.status === 'active' ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-gray-600 mb-4">{site.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">댓글 수</span>
                  <span className="text-sm font-medium text-gray-900">{site.commentsCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">생성일</span>
                  <span className="text-sm font-medium text-gray-900">{site.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">마지막 활동</span>
                  <span className="text-sm font-medium text-gray-900">{site.lastActivity}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="flat"
                  color={site.status === 'active' ? 'danger' : 'success'}
                  onPress={() => toggleSiteStatus(site.id)}
                >
                  {site.status === 'active' ? '비활성화' : '활성화'}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<Icon icon="material-symbols:settings" />}
                >
                  설정
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>새 사이트 추가</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="사이트 이름"
                    placeholder="예: 개인 블로그"
                    value={newSite.name}
                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  />
                  <Input
                    label="도메인"
                    placeholder="예: myblog.com"
                    value={newSite.domain}
                    onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                  />
                  <Input
                    label="설명"
                    placeholder="사이트에 대한 간단한 설명"
                    value={newSite.description}
                    onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  취소
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleAddSite}
                  isDisabled={!newSite.name || !newSite.domain}
                >
                  추가
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}